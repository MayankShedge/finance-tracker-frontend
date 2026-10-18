import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const currencyFormatter =
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  );

function formatCurrency(
  value = 0
) {
  return currencyFormatter.format(
    Number(value) || 0
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatPercentage(
  value = 0
) {
  return `${Number(
    value || 0
  ).toFixed(1)}%`;
}

function getInitialTransactionForm() {
  return {
    type: "expense",
    amount: "",
    category: "",
    merchant: "",
    description: "",
    date: "",
  };
}

function getInitialBudgetForm() {
  return {
    category: "overall",
    amount: "",
    period: "monthly",
  };
}

export default function Dashboard() {
  const {
    user,
    logout,
  } = useAuth();

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    budgets,
    setBudgets,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    categoryBreakdown,
    setCategoryBreakdown,
  ] = useState(null);

  const [
    monthlyTrend,
    setMonthlyTrend,
  ] = useState(null);

  const [
    budgetStatus,
    setBudgetStatus,
  ] = useState([]);

  const [
    transactionForm,
    setTransactionForm,
  ] = useState(
    getInitialTransactionForm
  );

  const [
    budgetForm,
    setBudgetForm,
  ] = useState(
    getInitialBudgetForm
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function loadDashboardData() {
    setLoading(true);
    setError("");

    try {
      const [
        transactionsResponse,
        budgetsResponse,
        summaryResponse,
        categoriesResponse,
        trendResponse,
        budgetStatusResponse,
      ] = await Promise.all([
        api.get("/transactions"),
        api.get("/budgets"),
        api.get(
          "/analytics/summary?period=current_month"
        ),
        api.get(
          "/analytics/categories?period=current_month"
        ),
        api.get(
          "/analytics/trend?months=6"
        ),
        api.get(
          "/analytics/budget-status"
        ),
      ]);

      setTransactions(
        transactionsResponse.data
      );

      setBudgets(
        budgetsResponse.data
      );

      setSummary(
        summaryResponse.data
      );

      setCategoryBreakdown(
        categoriesResponse.data
      );

      setMonthlyTrend(
        trendResponse.data
      );

      setBudgetStatus(
        budgetStatusResponse.data
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleAddTransaction(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const payload = {
        ...transactionForm,
        amount: Number(
          transactionForm.amount
        ),
        date:
          transactionForm.date ||
          undefined,
      };

      await api.post(
        "/transactions",
        payload
      );

      setTransactionForm(
        getInitialTransactionForm()
      );

      setSuccessMessage(
        "Transaction added successfully."
      );

      await loadDashboardData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add transaction"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddBudget(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const payload = {
        ...budgetForm,
        amount: Number(
          budgetForm.amount
        ),
        category:
          budgetForm.category.trim() ||
          "overall",
      };

      await api.post(
        "/budgets",
        payload
      );

      setBudgetForm(
        getInitialBudgetForm()
      );

      setSuccessMessage(
        "Budget created successfully."
      );

      await loadDashboardData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create budget"
      );
    } finally {
      setActionLoading(false);
    }
  }

  const recentTransactions =
    useMemo(() => {
      return [...transactions]
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .slice(0, 8);
    }, [transactions]);

  const maximumCategoryAmount =
    categoryBreakdown
      ?.categories?.length
      ? Math.max(
          ...categoryBreakdown.categories.map(
            (item) =>
              Number(
                item.amount
              ) || 0
          )
        )
      : 0;

  const maximumTrendValue =
    monthlyTrend?.trend?.length
      ? Math.max(
          ...monthlyTrend.trend.map(
            (item) =>
              Math.max(
                Number(
                  item.income
                ) || 0,
                Number(
                  item.expenses
                ) || 0
              )
          )
        )
      : 0;

  const displayedBudgetStatus =
    [...budgetStatus].sort(
      (a, b) =>
        Number(
          b.percentUsed || 0
        ) -
        Number(
          a.percentUsed || 0
        )
    );

  return (
    <div className="dashboard">
      <nav className="app-topbar" aria-label="Primary navigation">
        <Link className="app-brand" to="/dashboard">
          <span className="app-brand-mark">F</span>

          <span className="app-brand-copy">
            <strong>Finora</strong>
            <small>Personal finance, made smarter</small>
          </span>
        </Link>

        <div className="app-nav-scroll">
          <div className="app-nav-links">
            {/* New: Home page link */}
            <Link className="app-nav-link" to="/">
              Home
            </Link>

            <Link className="app-nav-link active" to="/dashboard">
              Dashboard
            </Link>

            <Link className="app-nav-link" to="/transactions">
              Transactions
            </Link>

            <Link className="app-nav-link" to="/goals">
              Goals
            </Link>

            <Link className="app-nav-link" to="/tasks">
              Tasks
            </Link>

            <Link className="app-nav-link" to="/chat">
              AI Assistant
            </Link>

            <Link className="app-nav-link" to="/import">
              Import
            </Link>

            <Link className="app-nav-link" to="/reminders">
              Reminders
            </Link>

            <Link className="app-nav-link" to="/devices">
              Devices
            </Link>
          </div>
        </div>

        <button
          className="logout-button app-logout-button"
          type="button"
          onClick={logout}
        >
          Log out
        </button>
      </nav>

      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Personal Finance
          </p>

          <h1>
            Hi, {user?.name}
          </h1>

          <p className="dashboard-subtitle">
            Here's how your money looks
            this month.
          </p>
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

      {loading ? (
        <div className="loading-state">
          Loading your financial overview...
        </div>
      ) : (
        <>
          <section className="summary-grid">
            <div className="metric-card">
              <span className="metric-label">
                Income
              </span>

              <strong className="metric-value positive">
                {formatCurrency(
                  summary?.income
                )}
              </strong>

              <span className="metric-meta">
                Current month
              </span>
            </div>

            <div className="metric-card">
              <span className="metric-label">
                Expenses
              </span>

              <strong className="metric-value negative">
                {formatCurrency(
                  summary?.expenses
                )}
              </strong>

              <span className="metric-meta">
                Current month
              </span>
            </div>

            <div className="metric-card">
              <span className="metric-label">
                Net
              </span>

              <strong
                className={`metric-value ${
                  Number(
                    summary?.net
                  ) >= 0
                    ? "positive"
                    : "negative"
                }`}
              >
                {formatCurrency(
                  summary?.net
                )}
              </strong>

              <span className="metric-meta">
                Income minus expenses
              </span>
            </div>

            <div className="metric-card">
              <span className="metric-label">
                Savings rate
              </span>

              <strong className="metric-value">
                {formatPercentage(
                  summary?.savingsRate
                )}
              </strong>

              <span className="metric-meta">
                {summary?.transactionCount ||
                  0}{" "}
                transactions
              </span>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Spending by category
                  </h2>

                  <p>
                    Where your money went this month.
                  </p>
                </div>

                <span className="panel-total">
                  {formatCurrency(
                    categoryBreakdown?.totalExpenses
                  )}
                </span>
              </div>

              {categoryBreakdown
                ?.categories
                ?.length ? (
                <div className="category-list">
                  {categoryBreakdown.categories
                    .slice(0, 8)
                    .map(
                      (item) => {
                        const width =
                          maximumCategoryAmount >
                          0
                            ? (Number(
                                item.amount
                              ) /
                                maximumCategoryAmount) *
                              100
                            : 0;

                        return (
                          <div
                            className="category-row"
                            key={
                              item.category
                            }
                          >
                            <div className="category-row-top">
                              <span>
                                {
                                  item.category
                                }
                              </span>

                              <span>
                                {formatCurrency(
                                  item.amount
                                )}
                              </span>
                            </div>

                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${width}%`,
                                }}
                              />
                            </div>

                            <div className="category-meta">
                              <span>
                                {formatPercentage(
                                  item.percentage
                                )}
                              </span>

                              <span>
                                {
                                  item.transactionCount
                                }{" "}
                                transaction
                                {item.transactionCount !==
                                1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              ) : (
                <div className="empty-state">
                  No expenses recorded this
                  month.
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Budget status
                  </h2>

                  <p>
                    Keep an eye on your active
                    budgets.
                  </p>
                </div>

                <span className="panel-count">
                  {
                    displayedBudgetStatus.length
                  }
                </span>
              </div>

              {displayedBudgetStatus.length ? (
                <div className="budget-status-list">
                  {displayedBudgetStatus.map(
                    (budget) => (
                      <div
                        className="budget-status-item"
                        key={
                          budget.budgetId
                        }
                      >
                        <div className="budget-status-top">
                          <div>
                            <strong>
                              {
                                budget.category
                              }
                            </strong>

                            <span>
                              {
                                budget.period
                              }
                            </span>
                          </div>

                          <span
                            className={`status-badge ${budget.status}`}
                          >
                            {
                              budget.status
                            }
                          </span>
                        </div>

                        <div className="budget-numbers">
                          <span>
                            {formatCurrency(
                              budget.spent
                            )}{" "}
                            spent
                          </span>

                          <span>
                            {formatCurrency(
                              budget.limit
                            )}{" "}
                            limit
                          </span>
                        </div>

                        <div className="progress-track">
                          <div
                            className={`progress-fill ${budget.status}`}
                            style={{
                              width: `${Math.min(
                                Number(
                                  budget.percentUsed
                                ) || 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="budget-meta">
                          <span>
                            {formatPercentage(
                              budget.percentUsed
                            )}{" "}
                            used
                          </span>

                          <span>
                            {budget.remaining >=
                            0
                              ? `${formatCurrency(
                                  budget.remaining
                                )} remaining`
                              : `${formatCurrency(
                                  Math.abs(
                                    budget.remaining
                                  )
                                )} over`}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  No active budgets yet.
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  Monthly trend
                </h2>

                <p>
                  Income and expenses over the
                  last{" "}
                  {monthlyTrend?.months ||
                    6}{" "}
                  months.
                </p>
              </div>
            </div>

            {monthlyTrend?.trend?.length ? (
              <div className="trend-chart">
                {monthlyTrend.trend.map(
                  (month) => {
                    const incomeHeight =
                      maximumTrendValue >
                      0
                        ? (Number(
                            month.income
                          ) /
                            maximumTrendValue) *
                          100
                        : 0;

                    const expenseHeight =
                      maximumTrendValue >
                      0
                        ? (Number(
                            month.expenses
                          ) /
                            maximumTrendValue) *
                          100
                        : 0;

                    return (
                      <div
                        className="trend-column"
                        key={`${month.year}-${month.month}`}
                      >
                        <div className="trend-bars">
                          <div
                            className="trend-bar income"
                            style={{
                              height: `${Math.max(
                                incomeHeight,
                                month.income >
                                  0
                                  ? 4
                                  : 0
                              )}%`,
                            }}
                            title={`Income: ${formatCurrency(
                              month.income
                            )}`}
                          />

                          <div
                            className="trend-bar expense"
                            style={{
                              height: `${Math.max(
                                expenseHeight,
                                month.expenses >
                                  0
                                  ? 4
                                  : 0
                              )}%`,
                            }}
                            title={`Expenses: ${formatCurrency(
                              month.expenses
                            )}`}
                          />
                        </div>

                        <span className="trend-label">
                          {
                            month.label
                          }
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="empty-state">
                Not enough data to show a
                trend yet.
              </div>
            )}

            <div className="chart-legend">
              <span>
                <i className="legend-dot income" />
                Income
              </span>

              <span>
                <i className="legend-dot expense" />
                Expenses
              </span>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Add transaction
                  </h2>

                  <p>
                    Quickly record income or an
                    expense.
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
                      value={
                        transactionForm.type
                      }
                      onChange={(event) =>
                        setTransactionForm(
                          (current) => ({
                            ...current,
                            type: event.target.value,
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
                      value={
                        transactionForm.amount
                      }
                      onChange={(event) =>
                        setTransactionForm(
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
                      placeholder="Food"
                      value={
                        transactionForm.category
                      }
                      onChange={(event) =>
                        setTransactionForm(
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
                      placeholder="Swiggy"
                      value={
                        transactionForm.merchant
                      }
                      onChange={(event) =>
                        setTransactionForm(
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
                        transactionForm.date
                      }
                      onChange={(event) =>
                        setTransactionForm(
                          (current) => ({
                            ...current,
                            date:
                              event.target
                                .value,
                          })
                        )
                      }
                    />
                  </label>

                  <label className="full-width">
                    Description
                    <input
                      type="text"
                      placeholder="Dinner with friends"
                      value={
                        transactionForm.description
                      }
                      onChange={(event) =>
                        setTransactionForm(
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

                <button
                  className="primary-button"
                  type="submit"
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Saving..."
                    : "Add transaction"}
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Set a budget
                  </h2>

                  <p>
                    Create a spending limit for a
                    category.
                  </p>
                </div>
              </div>

              <form
                onSubmit={
                  handleAddBudget
                }
                className="stacked-form"
              >
                <div className="form-grid">
                  <label className="full-width">
                    Category
                    <input
                      type="text"
                      placeholder="Food or overall"
                      value={
                        budgetForm.category
                      }
                      onChange={(event) =>
                        setBudgetForm(
                          (current) => ({
                            ...current,
                            category:
                              event.target
                                .value,
                          })
                        )
                      }
                    />
                  </label>

                  <label>
                    Amount
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="10000"
                      value={
                        budgetForm.amount
                      }
                      onChange={(event) =>
                        setBudgetForm(
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
                    Period
                    <select
                      value={
                        budgetForm.period
                      }
                      onChange={(event) =>
                        setBudgetForm(
                          (current) => ({
                            ...current,
                            period:
                              event.target
                                .value,
                          })
                        )
                      }
                    >
                      <option value="weekly">
                        Weekly
                      </option>

                      <option value="monthly">
                        Monthly
                      </option>

                      <option value="yearly">
                        Yearly
                      </option>
                    </select>
                  </label>
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Saving..."
                    : "Set budget"}
                </button>
              </form>

              <div className="simple-budget-list">
                {budgets.length ? (
                  budgets.map(
                    (budget) => (
                      <div
                        className="simple-budget-item"
                        key={
                          budget._id
                        }
                      >
                        <div>
                          <strong>
                            {
                              budget.category
                            }
                          </strong>

                          <span>
                            {
                              budget.period
                            }
                          </span>
                        </div>

                        <strong>
                          {formatCurrency(
                            budget.amount
                          )}
                        </strong>
                      </div>
                    )
                  )
                ) : (
                  <div className="empty-state compact">
                    You haven't created any
                    budgets yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  Recent transactions
                </h2>

                <p>
                  Your latest recorded activity.
                </p>
              </div>

              <div className="panel-header-actions">
                <span className="panel-count">
                  {
                    transactions.length
                  }
                </span>

                <Link
                  className="secondary-button small-button"
                  to="/transactions"
                >
                  View all
                </Link>
              </div>
            </div>

            {recentTransactions.length ? (
              <div className="transaction-list">
                {recentTransactions.map(
                  (transaction) => (
                    <div
                      className="transaction-row"
                      key={
                        transaction._id
                      }
                    >
                      <div className="transaction-main">
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
                              transaction.category}
                          </strong>

                          <span>
                            {transaction.merchant
                              ? transaction.category
                              : transaction.description ||
                                "No description"}
                          </span>
                        </div>
                      </div>

                      <div className="transaction-secondary">
                        <span>
                          {formatDate(
                            transaction.date
                          )}
                        </span>

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
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="empty-state">
                No transactions recorded yet.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}