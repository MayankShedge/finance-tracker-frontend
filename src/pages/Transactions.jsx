import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/axios";

const currencyFormatter =
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

function formatCurrency(value = 0) {
  return currencyFormatter.format(
    Number(value) || 0
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getInitialForm() {
  return {
    type: "expense",
    amount: "",
    category: "",
    merchant: "",
    description: "",
    date: "",
  };
}

function getTodayString() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1).padStart(
      2,
      "0"
    );

  const day =
    String(now.getDate()).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

export default function Transactions() {
  const [transactions, setTransactions] =
    useState([]);

  const [form, setForm] =
    useState(getInitialForm);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [editForm, setEditForm] =
    useState(getInitialForm);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    from: "",
    to: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function loadTransactions() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filters.type) {
        params.set(
          "type",
          filters.type
        );
      }

      if (filters.category.trim()) {
        params.set(
          "category",
          filters.category.trim()
        );
      }

      if (filters.from) {
        params.set(
          "from",
          filters.from
        );
      }

      if (filters.to) {
        params.set(
          "to",
          `${filters.to}T23:59:59.999`
        );
      }

      const queryString =
        params.toString();

      const { data } =
        await api.get(
          queryString
            ? `/transactions?${queryString}`
            : "/transactions"
        );

      setTransactions(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load transactions"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [
    filters.type,
    filters.category,
    filters.from,
    filters.to,
  ]);

  function updateFilter(
    field,
    value
  ) {
    setFilters(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function clearFilters() {
    setFilters({
      search: "",
      type: "",
      category: "",
      from: "",
      to: "",
    });
  }

  async function handleAddTransaction(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      await api.post(
        "/transactions",
        {
          ...form,
          amount: Number(
            form.amount
          ),
          date:
            form.date ||
            undefined,
        }
      );

      setForm(
        getInitialForm()
      );

      setSuccessMessage(
        "Transaction added successfully."
      );

      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add transaction"
      );
    } finally {
      setActionLoading(false);
    }
  }

  function startEditing(
    transaction
  ) {
    const transactionDate =
      transaction.date
        ? new Date(
            transaction.date
          )
        : null;

    let formattedDate = "";

    if (
      transactionDate &&
      !Number.isNaN(
        transactionDate.getTime()
      )
    ) {
      const year =
        transactionDate.getFullYear();

      const month =
        String(
          transactionDate.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          transactionDate.getDate()
        ).padStart(2, "0");

      formattedDate =
        `${year}-${month}-${day}`;
    }

    setEditingTransaction(
      transaction
    );

    setEditForm({
      type:
        transaction.type ||
        "expense",

      amount:
        transaction.amount ??
        "",

      category:
        transaction.category ||
        "",

      merchant:
        transaction.merchant ||
        "",

      description:
        transaction.description ||
        "",

      date:
        formattedDate,
    });

    setError("");
    setSuccessMessage("");
  }

  function cancelEditing() {
    setEditingTransaction(null);
    setEditForm(
      getInitialForm()
    );
  }

  async function handleUpdateTransaction(
    event
  ) {
    event.preventDefault();

    if (!editingTransaction) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      await api.put(
        `/transactions/${editingTransaction._id}`,
        {
          ...editForm,
          amount: Number(
            editForm.amount
          ),
          date:
            editForm.date ||
            undefined,
        }
      );

      setEditingTransaction(null);

      setEditForm(
        getInitialForm()
      );

      setSuccessMessage(
        "Transaction updated successfully."
      );

      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update transaction"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteTransaction(
    transactionId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this transaction?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await api.delete(
        `/transactions/${transactionId}`
      );

      if (
        editingTransaction?._id ===
        transactionId
      ) {
        cancelEditing();
      }

      setSuccessMessage(
        "Transaction deleted successfully."
      );

      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete transaction"
      );
    }
  }

  const filteredTransactions =
    useMemo(() => {
      const search =
        filters.search
          .trim()
          .toLowerCase();

      if (!search) {
        return transactions;
      }

      return transactions.filter(
        (transaction) => {
          const values = [
            transaction.category,
            transaction.merchant,
            transaction.description,
            transaction.type,
          ];

          return values.some(
            (value) =>
              String(
                value || ""
              )
                .toLowerCase()
                .includes(search)
          );
        }
      );
    }, [
      transactions,
      filters.search,
    ]);

  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    for (const transaction of filteredTransactions) {
      const amount =
        Number(
          transaction.amount
        ) || 0;

      if (
        transaction.type ===
        "income"
      ) {
        income += amount;
      } else {
        expenses += amount;
      }
    }

    return {
      income,
      expenses,
      net: income - expenses,
    };
  }, [filteredTransactions]);

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          transactions
            .map(
              (transaction) =>
                transaction.category
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [transactions]);

  return (
    <div className="dashboard transactions-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Personal Finance
          </p>

          <h1>
            Transactions
          </h1>

          <p className="dashboard-subtitle">
            View, search, filter and manage
            your financial activity.
          </p>
        </div>

        <Link
          className="secondary-button"
          to="/dashboard"
        >
          Back to dashboard
        </Link>
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

      <section className="summary-grid transaction-summary">
        <div className="metric-card">
          <span className="metric-label">
            Transactions
          </span>

          <strong className="metric-value">
            {filteredTransactions.length}
          </strong>

          <span className="metric-meta">
            Matching current filters
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Income
          </span>

          <strong className="metric-value positive">
            {formatCurrency(
              totals.income
            )}
          </strong>

          <span className="metric-meta">
            Matching transactions
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Expenses
          </span>

          <strong className="metric-value negative">
            {formatCurrency(
              totals.expenses
            )}
          </strong>

          <span className="metric-meta">
            Matching transactions
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Net
          </span>

          <strong
            className={`metric-value ${
              totals.net >= 0
                ? "positive"
                : "negative"
            }`}
          >
            {formatCurrency(
              totals.net
            )}
          </strong>

          <span className="metric-meta">
            Income minus expenses
          </span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Add transaction
            </h2>

            <p>
              Record a new income or expense.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handleAddTransaction
          }
          className="stacked-form"
        >
          <div className="form-grid">
            <label>
              Type
              <select
                value={form.type}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      type:
                        event.target.value,
                    })
                  )
                }
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>
            </label>

            <label>
              Amount
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="500"
                value={form.amount}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      amount:
                        event.target.value,
                    })
                  )
                }
                required
              />
            </label>

            <label>
              Category
              <input
                type="text"
                placeholder="Food"
                value={
                  form.category
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      category:
                        event.target.value,
                    })
                  )
                }
                required
              />
            </label>

            <label>
              Merchant
              <input
                type="text"
                placeholder="Swiggy"
                value={
                  form.merchant
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      merchant:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={form.date}
                max={getTodayString()}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      date:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label>
              Description
              <input
                type="text"
                placeholder="Dinner with friends"
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      description:
                        event.target.value,
                    })
                  )
                }
              />
            </label>
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={actionLoading}
          >
            {actionLoading
              ? "Saving..."
              : "Add transaction"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Filters
            </h2>

            <p>
              Narrow down the transactions you
              want to inspect.
            </p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        <div className="transaction-filters">
          <label>
            Search
            <input
              type="text"
              placeholder="Merchant, category, description..."
              value={
                filters.search
              }
              onChange={(event) =>
                updateFilter(
                  "search",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Type
            <select
              value={filters.type}
              onChange={(event) =>
                updateFilter(
                  "type",
                  event.target.value
                )
              }
            >
              <option value="">
                All types
              </option>

              <option value="expense">
                Expenses
              </option>

              <option value="income">
                Income
              </option>
            </select>
          </label>

          <label>
            Category
            <select
              value={
                filters.category
              }
              onChange={(event) =>
                updateFilter(
                  "category",
                  event.target.value
                )
              }
            >
              <option value="">
                All categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    value={category}
                    key={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            From
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                updateFilter(
                  "from",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                updateFilter(
                  "to",
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              All transactions
            </h2>

            <p>
              {filteredTransactions.length}{" "}
              transaction
              {filteredTransactions.length !==
              1
                ? "s"
                : ""}{" "}
              shown.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading transactions...
          </div>
        ) : filteredTransactions.length ===
          0 ? (
          <div className="empty-state">
            No transactions match your current
            filters.
          </div>
        ) : (
          <div className="transactions-table-wrapper">
            <div className="transactions-table">
              <div className="transactions-table-header">
                <span>
                  Transaction
                </span>

                <span>
                  Category
                </span>

                <span>
                  Date
                </span>

                <span>
                  Amount
                </span>

                <span>
                  Actions
                </span>
              </div>

              {filteredTransactions.map(
                (transaction) => (
                  <div
                    className="transactions-table-row"
                    key={
                      transaction._id
                    }
                  >
                    <div className="transaction-cell-main">
                      <div
                        className={`transaction-icon ${
                          transaction.type
                        }`}
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}
                      </div>

                      <div>
                        <strong>
                          {transaction.merchant ||
                            transaction.description ||
                            transaction.category}
                        </strong>

                        <span>
                          {transaction.description ||
                            "No description"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="category-chip">
                        {
                          transaction.category
                        }
                      </span>
                    </div>

                    <div className="transaction-date-cell">
                      {formatDate(
                        transaction.date
                      )}
                    </div>

                    <div>
                      <strong
                        className={
                          transaction.type ===
                          "income"
                            ? "positive"
                            : "negative"
                        }
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}
                        {formatCurrency(
                          transaction.amount
                        )}
                      </strong>
                    </div>

                    <div className="transaction-actions">
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() =>
                          startEditing(
                            transaction
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button small-button"
                        type="button"
                        onClick={() =>
                          handleDeleteTransaction(
                            transaction._id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </section>

      {editingTransaction && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-header">
              <div>
                <h2>
                  Edit transaction
                </h2>

                <p>
                  Update the transaction details.
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
                handleUpdateTransaction
              }
              className="stacked-form"
            >
              <div className="form-grid">
                <label>
                  Type
                  <select
                    value={
                      editForm.type
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          type:
                            event.target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="expense">
                      Expense
                    </option>

                    <option value="income">
                      Income
                    </option>
                  </select>
                </label>

                <label>
                  Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editForm.amount
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          amount:
                            event.target
                              .value,
                        })
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Category
                  <input
                    type="text"
                    value={
                      editForm.category
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          category:
                            event.target
                              .value,
                        })
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Merchant
                  <input
                    type="text"
                    value={
                      editForm.merchant
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          merchant:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Date
                  <input
                    type="date"
                    value={
                      editForm.date
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          date:
                            event.target
                              .value,
                        })
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Description
                  <input
                    type="text"
                    value={
                      editForm.description
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>
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