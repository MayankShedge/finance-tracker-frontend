import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/axios";

import "./Chat.css";

const ACTIVE_CONVERSATION_KEY =
  "financeTrackerActiveConversationId";

function createMessage(
  role,
  content,
  action = null,
  id = null
) {
  return {
    id:
      id ||
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    role,

    content,

    action,
  };
}

function normalizeAction(
  action
) {
  if (
    !action ||
    typeof action !==
      "object"
  ) {
    return null;
  }

  /*
    Empty Mongoose action subdocuments
    from older conversation records can
    contain only null/default values.

    They are NOT real actions and should
    never render a confirmation card.
  */
  if (
    !action.actionId &&
    !action.toolName
  ) {
    return null;
  }

  return {
    actionId:
      action.actionId ||
      action._id ||
      null,

    toolName:
      action.toolName ||
      null,

    risk:
      action.risk ||
      null,

    status:
      action.status ||
      null,

    toolArguments:
      action.toolArguments ||
      null,
  };
}


function normalizeAssistantContent(
  content = ""
) {
  /*
    Application amounts are INR. Also normalize
    older model responses that accidentally used $
    and convert literal HTML line-break tags into
    normal newlines before rendering.
  */
  return String(
    content
  )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(
      /\$(\s?)([0-9][0-9,]*(?:\.[0-9]+)?)/g,
      "₹$1$2"
    );
}

function renderInlineMarkdown(
  text,
  keyPrefix = ""
) {
  const parts =
    String(text)
      .split(
        /(\*\*[^*]+\*\*)/g
      );

  return parts.map(
    (
      part,
      index
    ) => {
      const isBold =
        /^\*\*.+\*\*$/.test(
          part
        );

      return isBold ? (
        <strong
          key={`${keyPrefix}bold-${index}`}
        >
          {part.slice(
            2,
            -2
          )}
        </strong>
      ) : (
        <Fragment
          key={`${keyPrefix}text-${index}`}
        >
          {part}
        </Fragment>
      );
    }
  );
}

function isMarkdownTableSeparator(
  line
) {
  const trimmed =
    line.trim();

  if (!trimmed.includes("|")) {
    return false;
  }

  const cells =
    trimmed
      .split("|")
      .map(
        (cell) =>
          cell.trim()
      )
      .filter(Boolean);

  return (
    cells.length > 0 &&
    cells.every(
      (cell) =>
        /^:?-{3,}:?$/.test(
          cell
        )
    )
  );
}

function parseMarkdownTable(
  lines
) {
  if (
    lines.length < 2 ||
    !lines[0].includes("|") ||
    !isMarkdownTableSeparator(
      lines[1]
    )
  ) {
    return null;
  }

  const rows =
    lines.map(
      (line) =>
        line
          .trim()
          .replace(
            /^\|/,
            ""
          )
          .replace(
            /\|$/,
            ""
          )
          .split("|")
          .map(
            (cell) =>
              cell.trim()
          )
    );

  return {
    headers:
      rows[0],
    rows:
      rows.slice(2),
  };
}

function renderMarkdownTable(
  table,
  tableIndex
) {
  return (
    <table
      className="assistant-table"
      key={`table-${tableIndex}`}
    >
      <thead>
        <tr>
          {table.headers.map(
            (
              header,
              index
            ) => (
              <th
                key={`header-${index}`}
              >
                {renderInlineMarkdown(
                  header,
                  `h-${index}-`
                )}
              </th>
            )
          )}
        </tr>
      </thead>

      <tbody>
        {table.rows.map(
          (
            row,
            rowIndex
          ) => (
            <tr
              key={`row-${rowIndex}`}
            >
              {table.headers.map(
                (
                  _,
                  columnIndex
                ) => (
                  <td
                    key={`cell-${rowIndex}-${columnIndex}`}
                  >
                    {renderInlineMarkdown(
                      row[columnIndex] ||
                        "",
                      `c-${rowIndex}-${columnIndex}-`
                    )}
                  </td>
                )
              )}
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

function renderAssistantContent(
  content = ""
) {
  const normalized =
    normalizeAssistantContent(
      content
    );

  const rawLines =
    normalized.split("\n");

  const nodes = [];

  let lineIndex = 0;
  let tableIndex = 0;

  while (
    lineIndex <
    rawLines.length
  ) {
    const currentLine =
      rawLines[
        lineIndex
      ];

    const nextLine =
      rawLines[
        lineIndex + 1
      ];

    /*
      Markdown table block:
      header
      separator
      rows...
    */
    if (
      currentLine.includes("|") &&
      isMarkdownTableSeparator(
        nextLine || ""
      )
    ) {
      const tableLines = [
        currentLine,
        nextLine,
      ];

      lineIndex += 2;

      while (
        lineIndex <
          rawLines.length &&
        rawLines[
          lineIndex
        ].includes("|") &&
        rawLines[
          lineIndex
        ].trim()
      ) {
        tableLines.push(
          rawLines[
            lineIndex
          ]
        );

        lineIndex += 1;
      }

      const table =
        parseMarkdownTable(
          tableLines
        );

      if (table) {
        nodes.push(
          renderMarkdownTable(
            table,
            tableIndex
          )
        );

        tableIndex += 1;
        continue;
      }
    }

    /*
      Blank lines create visual spacing.
    */
    if (
      !currentLine.trim()
    ) {
      nodes.push(
        <div
          key={`space-${lineIndex}`}
          className="assistant-line-break"
        />
      );

      lineIndex += 1;

      continue;
    }

    /*
      Basic unordered-list support for model
      responses using "-" or "*".
    */
    if (
      /^[-*]\s+/.test(
        currentLine.trim()
      )
    ) {
      const listItems = [];

      while (
        lineIndex <
          rawLines.length &&
        /^[-*]\s+/.test(
          rawLines[
            lineIndex
          ].trim()
        )
      ) {
        listItems.push(
          rawLines[
            lineIndex
          ]
            .trim()
            .replace(
              /^[-*]\s+/,
              ""
            )
        );

        lineIndex += 1;
      }

      nodes.push(
        <ul
          key={`list-${lineIndex}`}
          className="assistant-list"
        >
          {listItems.map(
            (
              item,
              itemIndex
            ) => (
              <li
                key={`item-${itemIndex}`}
              >
                {renderInlineMarkdown(
                  item,
                  `li-${itemIndex}-`
                )}
              </li>
            )
          )}
        </ul>
      );

      continue;
    }

    nodes.push(
      <div
        key={`line-${lineIndex}`}
        className="assistant-text-line"
      >
        {renderInlineMarkdown(
          currentLine,
          `line-${lineIndex}-`
        )}
      </div>
    );

    lineIndex += 1;
  }

  return nodes;
}

function getActionLabel(
  toolName
) {
  const labels = {
    "finance.create_transaction":
      "Create transaction",

    "finance.update_transaction":
      "Update transaction",

    "finance.delete_transaction":
      "Delete transaction",

    "finance.create_budget":
      "Create budget",

    "finance.delete_budget":
      "Delete budget",

    "goals.create_goal":
      "Create savings goal",

    "goals.update_goal":
      "Update savings goal",

    "goals.contribute_to_goal":
      "Add money to savings goal",

    "goals.delete_goal":
      "Delete savings goal",

    "tasks.create_task":
      "Create task",

    "tasks.update_task":
      "Update task",

    "tasks.complete_task":
      "Complete task",

    "tasks.reopen_task":
      "Reopen task",

    "tasks.delete_task":
      "Delete task",
  };

  return (
    labels[toolName] ||
    "Application action"
  );
}

function formatAmount(
  value
) {
  if (
    typeof value !==
    "number"
  ) {
    return null;
  }

  return `₹${value.toLocaleString(
    "en-IN"
  )}`;
}

function describeAction(
  action
) {
  const args =
    action?.toolArguments ||
    {};

  switch (
    action?.toolName
  ) {
    case "finance.create_transaction":
      return (
        `${args.type === "expense"
          ? "Add"
          : "Record"} ` +
        `${formatAmount(
          args.amount
        ) || "amount"} ` +
        `${args.category || "transaction"}` +
        (
          args.merchant
            ? ` at ${args.merchant}`
            : ""
        )
      );

    case "finance.update_transaction":
      return "Update an existing transaction";

    case "finance.delete_transaction":
      return "Permanently delete an existing transaction";

    case "finance.create_budget":
      return (
        `Create ${
          args.category ||
          "overall"
        } ${
          args.period ||
          ""
        } budget`
      );

    case "finance.delete_budget":
      return "Permanently delete a budget";

    case "goals.create_goal":
      return (
        `Create the ${
          args.name ||
          "new"
        } savings goal`
      );

    case "goals.update_goal":
      return "Update an existing savings goal";

    case "goals.contribute_to_goal":
      return (
        `Add ${
          formatAmount(
            args.amount
          ) || "money"
        } to the savings goal`
      );

    case "goals.delete_goal":
      return "Permanently delete a savings goal";

    case "tasks.create_task":
      return `Create task "${args.title || ""}"`;

    case "tasks.update_task":
      return "Update an existing task";

    case "tasks.complete_task":
      return "Mark the task as completed";

    case "tasks.reopen_task":
      return "Reopen the task";

    case "tasks.delete_task":
      return "Permanently delete the task";

    default:
      return "The assistant wants to perform an action";
  }
}

function convertConversationMessages(
  messages = []
) {
  return messages.map(
    (message) =>
      createMessage(
        message.role,

        message.content,

        normalizeAction(
          message.action
        ),

        message._id
      )
  );
}

export default function Chat() {
  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    conversationId,
    setConversationId,
  ] = useState(() =>
    localStorage.getItem(
      ACTIVE_CONVERSATION_KEY
    )
  );

  const [
    input,
    setInput,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(
    Boolean(
      localStorage.getItem(
        ACTIVE_CONVERSATION_KEY
      )
    )
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  const bottomRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  useEffect(() => {
    async function loadConversation() {
      if (
        !conversationId
      ) {
        setLoadingConversation(
          false
        );

        return;
      }

      setLoadingConversation(
        true
      );

      try {
        const {
          data,
        } = await api.get(
          `/agents/conversations/${conversationId}`
        );

        setMessages(
          convertConversationMessages(
            data.messages
          )
        );
      } catch (err) {
        localStorage.removeItem(
          ACTIVE_CONVERSATION_KEY
        );

        setConversationId(
          null
        );

        setMessages([]);

        setError(
          err.response?.data
            ?.message ||
            "Could not load the previous conversation."
        );
      } finally {
        setLoadingConversation(
          false
        );
      }
    }

    loadConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
      }
    );
  }, [
    messages,
    loading,
  ]);

  async function handleSend(
    providedMessage
  ) {
    const message =
      (
        providedMessage ??
        input
      ).trim();

    if (
      !message ||
      loading ||
      loadingConversation
    ) {
      return;
    }

    setInput("");

    setError("");

    setLoading(true);

    const localUserMessage =
      createMessage(
        "user",
        message
      );

    setMessages(
      (current) => [
        ...current,
        localUserMessage,
      ]
    );

    try {
      const {
        data,
      } = await api.post(
        "/agents/chat",
        {
          message,

          conversationId:
            conversationId ||
            undefined,
        }
      );

      if (
        data.conversationId &&
        data.conversationId !==
          conversationId
      ) {
        setConversationId(
          data.conversationId
        );

        localStorage.setItem(
          ACTIVE_CONVERSATION_KEY,
          data.conversationId
        );
      }

      if (
        data.status ===
        "confirmation_required"
      ) {
        const normalizedAction =
          normalizeAction(
            data.action
          );

        if (
          normalizedAction
        ) {
          setMessages(
            (current) => [
              ...current,

              createMessage(
                "assistant",

                "This action needs your confirmation before I can execute it.",

                normalizedAction
              ),
            ]
          );
        } else {
          setMessages(
            (current) => [
              ...current,

              createMessage(
                "assistant",

                "I couldn't prepare the requested action correctly."
              ),
            ]
          );
        }

        return;
      }

      setMessages(
        (current) => [
          ...current,

          createMessage(
            "assistant",
            data.reply ||
              "I couldn't generate a response."
          ),
        ]
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Could not reach the AI assistant."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  }

  async function handleConfirm(
    messageId,
    actionId
  ) {
    if (
      actionLoading ||
      !actionId
    ) {
      return;
    }

    setError("");

    setActionLoading(
      messageId
    );

    try {
      const {
        data,
      } = await api.post(
        `/agent-actions/${actionId}/confirm`
      );

      setMessages(
        (current) =>
          current.map(
            (message) => {
              if (
                message.id !==
                messageId
              ) {
                return message;
              }

              const returnedAction =
                normalizeAction(
                  data.action
                );

              return {
                ...message,

                content:
                  data.reply ||
                  "The action was completed successfully.",

                action:
                  returnedAction ||
                  {
                    ...message.action,

                    status:
                      "executed",
                  },
              };
            }
          )
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Could not confirm the action."
      );
    } finally {
      setActionLoading(
        null
      );
    }
  }

  async function handleReject(
    messageId,
    actionId
  ) {
    if (
      actionLoading ||
      !actionId
    ) {
      return;
    }

    setError("");

    setActionLoading(
      messageId
    );

    try {
      const {
        data,
      } = await api.post(
        `/agent-actions/${actionId}/reject`
      );

      setMessages(
        (current) =>
          current.map(
            (message) => {
              if (
                message.id !==
                messageId
              ) {
                return message;
              }

              const returnedAction =
                normalizeAction(
                  data.action
                );

              return {
                ...message,

                content:
                  "Okay, I cancelled that action.",

                action:
                  returnedAction ||
                  {
                    ...message.action,

                    status:
                      "rejected",
                  },
              };
            }
          )
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Could not reject the action."
      );
    } finally {
      setActionLoading(
        null
      );
    }
  }

  function clearConversation() {
    localStorage.removeItem(
      ACTIVE_CONVERSATION_KEY
    );

    setConversationId(
      null
    );

    setMessages([]);

    setError("");

    setInput("");

    setLoadingConversation(
      false
    );

    textareaRef.current?.focus();
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <p className="eyebrow">
            AI Assistant
          </p>

          <h1>
            Finance Companion
          </h1>

          <p className="chat-subtitle">
            Ask about your money, goals, and daily tasks.
          </p>
        </div>

        <div className="chat-header-actions">
          <Link
            className="secondary-button"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            className="secondary-button"
            to="/tasks"
          >
            Tasks
          </Link>

          <button
            className="secondary-button"
            type="button"
            onClick={
              clearConversation
            }
          >
            New chat
          </button>
        </div>
      </header>

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <main className="chat-shell">
        <section className="chat-messages">
          {loadingConversation ? (
            <div className="chat-empty">
              <h2>
                Loading conversation...
              </h2>
            </div>
          ) : messages.length ===
            0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                ✦
              </div>

              <h2>
                What would you like help with?
              </h2>

              <p>
                I can analyze your finances, check goals,
                and help organize your everyday tasks.
              </p>

              <div className="suggestion-grid">
                {[
                  "How much did I spend this month?",
                  "How is my savings goal doing?",
                  "What tasks are due today?",
                  "Am I spending too much on food?",
                ].map(
                  (suggestion) => (
                    <button
                      key={
                        suggestion
                      }
                      type="button"
                      onClick={() =>
                        handleSend(
                          suggestion
                        )
                      }
                    >
                      {
                        suggestion
                      }
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <>
              {messages.map(
                (message) => (
                  <div
                    key={
                      message.id
                    }
                    className={`chat-message ${
                      message.role ===
                      "user"
                        ? "user"
                        : "assistant"
                    }`}
                  >
                    <div className="chat-avatar">
                      {message.role ===
                      "user"
                        ? "Y"
                        : "✦"}
                    </div>

                    <div className="chat-message-content">
                      {message.content && (
                        <div className="chat-bubble">
                          {renderAssistantContent(
                            message.content
                          )}
                        </div>
                      )}

                      {message.action && (
                        <div className="confirmation-card">
                          <div className="confirmation-top">
                            <div>
                              <span className="confirmation-label">
                                Confirmation
                              </span>

                              <h3>
                                {
                                  getActionLabel(
                                    message.action
                                      .toolName
                                  )
                                }
                              </h3>
                            </div>

                            <span
                              className={`risk-badge ${
                                message.action
                                  .risk ||
                                "medium"
                              }`}
                            >
                              {message.action
                                .risk ||
                                "medium"}{" "}
                              risk
                            </span>
                          </div>

                          <p className="confirmation-description">
                            {describeAction(
                              message.action
                            )}
                          </p>

                          {message.action
                            .status ===
                          "pending" ? (
                            <div className="confirmation-actions">
                              <button
                                className="primary-button"
                                type="button"
                                disabled={
                                  actionLoading ===
                                  message.id
                                }
                                onClick={() =>
                                  handleConfirm(
                                    message.id,

                                    message.action
                                      .actionId
                                  )
                                }
                              >
                                {actionLoading ===
                                message.id
                                  ? "Processing..."
                                  : "Confirm"}
                              </button>

                              <button
                                className="secondary-button"
                                type="button"
                                disabled={
                                  actionLoading ===
                                  message.id
                                }
                                onClick={() =>
                                  handleReject(
                                    message.id,

                                    message.action
                                      .actionId
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`confirmation-status ${
                                message.action
                                  .status
                              }`}
                            >
                              {message.action
                                .status ===
                              "executed"
                                ? "✓ Action completed"
                                : message.action
                                    .status ===
                                  "rejected"
                                  ? "Action cancelled"
                                  : message.action
                                      .status ===
                                    "failed"
                                    ? "Action failed"
                                    : message.action
                                        .status}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="chat-message assistant">
                  <div className="chat-avatar">
                    ✦
                  </div>

                  <div className="chat-bubble typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div
                ref={
                  bottomRef
                }
              />
            </>
          )}
        </section>

        <section className="chat-composer">
          <div className="chat-composer-hint">
            Your conversation is saved so you can continue
            after refreshing the page.
          </div>

          <div className="chat-input-row">
            <textarea
              ref={
                textareaRef
              }
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask something like “How much did I spend on food this month?”"
              rows={2}
              disabled={
                loading ||
                loadingConversation
              }
            />

            <button
              className="primary-button chat-send-button"
              type="button"
              onClick={() =>
                handleSend()
              }
              disabled={
                loading ||
                loadingConversation ||
                !input.trim()
              }
            >
              {loading
                ? "Thinking..."
                : "Send"}
            </button>
          </div>

          <span className="chat-input-note">
            Enter to send · Shift + Enter for a new line
          </span>
        </section>
      </main>
    </div>
  );
}