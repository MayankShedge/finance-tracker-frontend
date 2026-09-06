import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/axios";

function getInitialForm() {
  return {
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    reminderEnabled: false,
    reminderAt: "",
  };
}

function toDateTimeLocal(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(
  value
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getDueLabel(
  task
) {
  switch (task.dueStatus) {
    case "overdue":
      return "Overdue";

    case "due_soon":
      return "Due soon";

    case "completed":
      return "Completed";

    case "upcoming":
      return "Upcoming";

    default:
      return "No due date";
  }
}

function getStatusClass(
  task
) {
  if (task.status === "completed") {
    return "completed";
  }

  if (task.dueStatus === "overdue") {
    return "overdue";
  }

  if (task.dueStatus === "due_soon") {
    return "due-soon";
  }

  return "upcoming";
}

export default function Tasks() {
  const [tasks, setTasks] =
    useState([]);

  const [filter, setFilter] =
    useState("todo");

  const [priorityFilter, setPriorityFilter] =
    useState("");

  const [form, setForm] =
    useState(
      getInitialForm
    );

  const [editingTask, setEditingTask] =
    useState(null);

  const [editForm, setEditForm] =
    useState(
      getInitialForm
    );

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const params =
        new URLSearchParams();

      if (
        filter &&
        filter !== "all"
      ) {
        params.set(
          "status",
          filter
        );
      }

      if (priorityFilter) {
        params.set(
          "priority",
          priorityFilter
        );
      }

      const query =
        params.toString();

      const { data } =
        await api.get(
          query
            ? `/tasks?${query}`
            : "/tasks"
        );

      setTasks(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load tasks"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [
    filter,
    priorityFilter,
  ]);

  function updateForm(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function updateEditForm(
    field,
    value
  ) {
    setEditForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function buildTaskPayload(
    taskForm
  ) {
    return {
      title:
        taskForm.title.trim(),

      description:
        taskForm.description.trim(),

      dueDate:
        taskForm.dueDate
          ? taskForm.dueDate
          : null,

      priority:
        taskForm.priority,

      reminderEnabled:
        Boolean(
          taskForm.reminderEnabled
        ),

      reminderAt:
        taskForm.reminderEnabled &&
        taskForm.reminderAt
          ? new Date(
              taskForm.reminderAt
            ).toISOString()
          : null,
    };
  }

  async function handleCreateTask(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      await api.post(
        "/tasks",
        buildTaskPayload(form)
      );

      setForm(
        getInitialForm()
      );

      setSuccessMessage(
        "Task created successfully."
      );

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create task"
      );
    } finally {
      setActionLoading(false);
    }
  }

  function startEditing(
    task
  ) {
    setEditingTask(
      task
    );

    setEditForm({
      title:
        task.title || "",

      description:
        task.description ||
        "",

      dueDate:
        task.dueDate
          ? toDateTimeLocal(
              task.dueDate
            )
          : "",

      priority:
        task.priority ||
        "medium",

      reminderEnabled:
        Boolean(
          task.reminderEnabled
        ),

      reminderAt:
        task.reminderAt
          ? toDateTimeLocal(
              task.reminderAt
            )
          : "",
    });

    setError("");
    setSuccessMessage("");
  }

  function cancelEditing() {
    setEditingTask(null);

    setEditForm(
      getInitialForm()
    );
  }

  async function handleUpdateTask(
    event
  ) {
    event.preventDefault();

    if (!editingTask) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      await api.put(
        `/tasks/${editingTask._id}`,
        buildTaskPayload(
          editForm
        )
      );

      setEditingTask(null);

      setEditForm(
        getInitialForm()
      );

      setSuccessMessage(
        "Task updated successfully."
      );

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update task"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCompleteTask(
    taskId
  ) {
    setError("");
    setSuccessMessage("");

    try {
      await api.patch(
        `/tasks/${taskId}/complete`
      );

      setSuccessMessage(
        "Task completed."
      );

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not complete task"
      );
    }
  }

  async function handleReopenTask(
    taskId
  ) {
    setError("");
    setSuccessMessage("");

    try {
      await api.patch(
        `/tasks/${taskId}/reopen`
      );

      setSuccessMessage(
        "Task reopened."
      );

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not reopen task"
      );
    }
  }

  async function handleDeleteTask(
    taskId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await api.delete(
        `/tasks/${taskId}`
      );

      if (
        editingTask?._id ===
        taskId
      ) {
        cancelEditing();
      }

      setSuccessMessage(
        "Task deleted successfully."
      );

      await loadTasks();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete task"
      );
    }
  }

  const stats =
    useMemo(() => {
      const todo =
        tasks.filter(
          (task) =>
            task.status ===
            "todo"
        ).length;

      const completed =
        tasks.filter(
          (task) =>
            task.status ===
            "completed"
        ).length;

      const overdue =
        tasks.filter(
          (task) =>
            task.isOverdue &&
            task.status !==
              "completed"
        ).length;

      const reminders =
        tasks.filter(
          (task) =>
            task.reminderEnabled
        ).length;

      return {
        todo,
        completed,
        overdue,
        reminders,
      };
    }, [tasks]);

  return (
    <div className="dashboard tasks-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Personal Productivity
          </p>

          <h1>
            Tasks & reminders
          </h1>

          <p className="dashboard-subtitle">
            Keep track of everyday things you need
            to get done.
          </p>
        </div>

        <div className="header-actions">
          <nav className="page-nav">
            <Link
              className="nav-link"
              to="/dashboard"
            >
              Dashboard
            </Link>

            <Link
              className="nav-link"
              to="/transactions"
            >
              Transactions
            </Link>

            <Link
              className="nav-link"
              to="/goals"
            >
              Goals
            </Link>

            <Link
              className="nav-link active"
              to="/tasks"
            >
              Tasks
            </Link>
          </nav>

          <Link
            className="secondary-button"
            to="/import"
          >
            Import
          </Link>
        </div>
      </header>

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="message success">
          {successMessage}
        </div>
      )}

      <section className="summary-grid task-summary">
        <div className="metric-card">
          <span className="metric-label">
            To do
          </span>

          <strong className="metric-value">
            {stats.todo}
          </strong>

          <span className="metric-meta">
            Tasks requiring attention
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Completed
          </span>

          <strong className="metric-value positive">
            {stats.completed}
          </strong>

          <span className="metric-meta">
            Completed tasks
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Overdue
          </span>

          <strong
            className={`metric-value ${
              stats.overdue > 0
                ? "negative"
                : "positive"
            }`}
          >
            {stats.overdue}
          </strong>

          <span className="metric-meta">
            Tasks past their due date
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Reminders
          </span>

          <strong className="metric-value">
            {stats.reminders}
          </strong>

          <span className="metric-meta">
            Tasks with reminders
          </span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Create a task
            </h2>

            <p>
              Add something you need to remember or
              complete.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handleCreateTask
          }
          className="stacked-form"
        >
          <div className="form-grid">
            <label className="full-width">
              Title
              <input
                type="text"
                placeholder="Pay electricity bill"
                value={form.title}
                onChange={(event) =>
                  updateForm(
                    "title",
                    event.target.value
                  )
                }
                maxLength={200}
                required
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                placeholder="Pay before the 10th of the month"
                value={
                  form.description
                }
                onChange={(event) =>
                  updateForm(
                    "description",
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={3}
              />
            </label>

            <label>
              Due date
              <input
                type="datetime-local"
                value={
                  form.dueDate
                }
                onChange={(event) =>
                  updateForm(
                    "dueDate",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Priority
              <select
                value={
                  form.priority
                }
                onChange={(event) =>
                  updateForm(
                    "priority",
                    event.target.value
                  )
                }
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </label>

            <label className="checkbox-field">
              <span>
                Reminder
              </span>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={
                    form.reminderEnabled
                  }
                  onChange={(event) =>
                    updateForm(
                      "reminderEnabled",
                      event.target.checked
                    )
                  }
                />

                <span>
                  Enable reminder
                </span>
              </div>
            </label>

            {form.reminderEnabled && (
              <label>
                Remind me at
                <input
                  type="datetime-local"
                  value={
                    form.reminderAt
                  }
                  onChange={(event) =>
                    updateForm(
                      "reminderAt",
                      event.target.value
                    )
                  }
                  required
                />
              </label>
            )}
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={actionLoading}
          >
            {actionLoading
              ? "Creating..."
              : "Create task"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Your tasks
            </h2>

            <p>
              Filter your tasks by status and priority.
            </p>
          </div>

          <div className="task-filter-group">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
            >
              <option value="todo">
                To do
              </option>

              <option value="in_progress">
                In progress
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>

              <option value="all">
                All
              </option>
            </select>

            <select
              value={
                priorityFilter
              }
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                All priorities
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            No tasks match the current filters.
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article
                className="task-card"
                key={task._id}
              >
                <div className="task-card-top">
                  <div className="task-title-area">
                    <div className="task-checkbox">
                      {task.status ===
                      "completed" ? (
                        <button
                          className="task-check-button completed"
                          type="button"
                          onClick={() =>
                            handleReopenTask(
                              task._id
                            )
                          }
                          aria-label="Reopen task"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          className="task-check-button"
                          type="button"
                          onClick={() =>
                            handleCompleteTask(
                              task._id
                            )
                          }
                          aria-label="Complete task"
                        />
                      )}
                    </div>

                    <div>
                      <h3
                        className={
                          task.status ===
                          "completed"
                            ? "task-completed-title"
                            : ""
                        }
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p>
                          {
                            task.description
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="task-badges">
                    <span
                      className={`priority-badge ${task.priority}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`due-badge ${getStatusClass(
                        task
                      )}`}
                    >
                      {getDueLabel(
                        task
                      )}
                    </span>
                  </div>
                </div>

                <div className="task-details">
                  <div>
                    <span>
                      Due
                    </span>

                    <strong>
                      {task.dueDate
                        ? formatDateTime(
                            task.dueDate
                          )
                        : "No due date"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Reminder
                    </span>

                    <strong>
                      {task.reminderEnabled
                        ? formatDateTime(
                            task.reminderAt
                          )
                        : "Off"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {task.status.replace(
                        "_",
                        " "
                      )}
                    </strong>
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    className="secondary-button small-button"
                    type="button"
                    onClick={() =>
                      startEditing(
                        task
                      )
                    }
                  >
                    Edit
                  </button>

                  {task.status ===
                  "completed" ? (
                    <button
                      className="secondary-button small-button"
                      type="button"
                      onClick={() =>
                        handleReopenTask(
                          task._id
                        )
                      }
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      className="primary-button small-button"
                      type="button"
                      onClick={() =>
                        handleCompleteTask(
                          task._id
                        )
                      }
                    >
                      Complete
                    </button>
                  )}

                  <button
                    className="danger-button small-button"
                    type="button"
                    onClick={() =>
                      handleDeleteTask(
                        task._id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editingTask && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header">
              <div>
                <h2>
                  Edit task
                </h2>

                <p>
                  Update the task details and reminder.
                </p>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={
                  cancelEditing
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleUpdateTask
              }
              className="stacked-form"
            >
              <div className="form-grid">
                <label className="full-width">
                  Title
                  <input
                    type="text"
                    value={
                      editForm.title
                    }
                    onChange={(event) =>
                      updateEditForm(
                        "title",
                        event.target.value
                      )
                    }
                    maxLength={200}
                    required
                  />
                </label>

                <label className="full-width">
                  Description
                  <textarea
                    value={
                      editForm.description
                    }
                    onChange={(event) =>
                      updateEditForm(
                        "description",
                        event.target.value
                      )
                    }
                    maxLength={1000}
                    rows={3}
                  />
                </label>

                <label>
                  Due date
                  <input
                    type="datetime-local"
                    value={
                      editForm.dueDate
                    }
                    onChange={(event) =>
                      updateEditForm(
                        "dueDate",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Priority
                  <select
                    value={
                      editForm.priority
                    }
                    onChange={(event) =>
                      updateEditForm(
                        "priority",
                        event.target.value
                      )
                    }
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>
                  </select>
                </label>

                <label className="checkbox-field">
                  <span>
                    Reminder
                  </span>

                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={
                        editForm.reminderEnabled
                      }
                      onChange={(event) =>
                        updateEditForm(
                          "reminderEnabled",
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      Enable reminder
                    </span>
                  </div>
                </label>

                {editForm.reminderEnabled && (
                  <label>
                    Remind me at
                    <input
                      type="datetime-local"
                      value={
                        editForm.reminderAt
                      }
                      onChange={(event) =>
                        updateEditForm(
                          "reminderAt",
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}