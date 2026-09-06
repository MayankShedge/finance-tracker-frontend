import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
  };
}

export default function Goals() {
  const { user } = useAuth();

  const [goals, setGoals] = useState([]);
  const [form, setForm] =
    useState(getInitialForm);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [contributionLoading, setContributionLoading] =
    useState(null);

  const [contributionAmounts, setContributionAmounts] =
    useState({});

  const [filter, setFilter] =
    useState("active");

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function loadGoals() {
    setLoading(true);
    setError("");

    try {
      const { data } =
        await api.get(
          `/goals?status=${filter}`
        );

      setGoals(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load goals"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, [filter]);

  async function handleCreateGoal(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      await api.post(
        "/goals",
        {
          ...form,
          targetAmount: Number(
            form.targetAmount
          ),
          currentAmount:
            form.currentAmount
              ? Number(form.currentAmount)
              : 0,
        }
      );

      setForm(getInitialForm());

      setSuccessMessage(
        "Goal created successfully."
      );

      await loadGoals();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create goal"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleContribution(
    goalId
  ) {
    const rawAmount =
      contributionAmounts[goalId];

    const amount = Number(rawAmount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Enter a valid contribution amount."
      );
      return;
    }

    setError("");
    setSuccessMessage("");
    setContributionLoading(goalId);

    try {
      await api.post(
        `/goals/${goalId}/contribute`,
        {
          amount,
        }
      );

      setContributionAmounts(
        (current) => ({
          ...current,
          [goalId]: "",
        })
      );

      setSuccessMessage(
        "Contribution added successfully."
      );

      await loadGoals();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add contribution"
      );
    } finally {
      setContributionLoading(null);
    }
  }

  async function handleDeleteGoal(
    goalId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this goal?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await api.delete(
        `/goals/${goalId}`
      );

      setSuccessMessage(
        "Goal deleted successfully."
      );

      await loadGoals();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete goal"
      );
    }
  }

  const activeGoalsCount =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            goal.status === "active"
        ).length,
      [goals]
    );

  const totalTarget = useMemo(
    () =>
      goals.reduce(
        (sum, goal) =>
          sum +
          Number(
            goal.targetAmount || 0
          ),
        0
      ),
    [goals]
  );

  const totalCurrent = useMemo(
    () =>
      goals.reduce(
        (sum, goal) =>
          sum +
          Number(
            goal.currentAmount || 0
          ),
        0
      ),
    [goals]
  );

  return (
    <div className="dashboard goals-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Personal Finance
          </p>

          <h1>
            {user?.name}'s goals
          </h1>

          <p className="dashboard-subtitle">
            Turn the things you want into
            measurable savings plans.
          </p>
        </div>

        <a
          className="secondary-button"
          href="/dashboard"
        >
          Back to dashboard
        </a>
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

      <section className="summary-grid goal-summary">
        <div className="metric-card">
          <span className="metric-label">
            Goals shown
          </span>

          <strong className="metric-value">
            {goals.length}
          </strong>

          <span className="metric-meta">
            {filter === "active"
              ? `${activeGoalsCount} active`
              : `${filter} goals`}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Total target
          </span>

          <strong className="metric-value">
            {formatCurrency(
              totalTarget
            )}
          </strong>

          <span className="metric-meta">
            Across shown goals
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Saved so far
          </span>

          <strong className="metric-value positive">
            {formatCurrency(
              totalCurrent
            )}
          </strong>

          <span className="metric-meta">
            Across shown goals
          </span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Create a savings goal
            </h2>

            <p>
              Set a target and deadline and we'll
              calculate the required pace.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateGoal}
          className="stacked-form"
        >
          <div className="form-grid">
            <label>
              Goal name
              <input
                type="text"
                placeholder="New laptop"
                value={form.name}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      name: event.target.value,
                    })
                  )
                }
                required
              />
            </label>

            <label>
              Target amount
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="80000"
                value={
                  form.targetAmount
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      targetAmount:
                        event.target.value,
                    })
                  )
                }
                required
              />
            </label>

            <label>
              Already saved
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="10000"
                value={
                  form.currentAmount
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      currentAmount:
                        event.target.value,
                    })
                  )
                }
              />
            </label>

            <label>
              Target date
              <input
                type="date"
                value={
                  form.targetDate
                }
                min={
                  new Date(
                    Date.now() +
                      24 * 60 * 60 * 1000
                  )
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      targetDate:
                        event.target.value,
                    })
                  )
                }
                required
              />
            </label>
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={actionLoading}
          >
            {actionLoading
              ? "Creating..."
              : "Create goal"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Your goals
            </h2>

            <p>
              Track progress and keep your savings
              on pace.
            </p>
          </div>

          <select
            className="goal-filter"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
          >
            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="archived">
              Archived
            </option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="empty-state">
            {filter === "active"
              ? "You don't have any active goals yet."
              : `You don't have any ${filter} goals.`}
          </div>
        ) : (
          <div className="goals-list">
            {goals.map((goal) => (
              <article
                className="goal-card"
                key={goal._id}
              >
                <div className="goal-card-header">
                  <div>
                    <h3>
                      {goal.name}
                    </h3>

                    <span className="goal-date">
                      Target:{" "}
                      {formatDate(
                        goal.targetDate
                      )}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${goal.status}`}
                  >
                    {goal.status}
                  </span>
                </div>

                <div className="goal-amount-row">
                  <div>
                    <span>
                      Saved
                    </span>

                    <strong>
                      {formatCurrency(
                        goal.currentAmount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Target
                    </span>

                    <strong>
                      {formatCurrency(
                        goal.targetAmount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Remaining
                    </span>

                    <strong>
                      {formatCurrency(
                        goal.remainingAmount
                      )}
                    </strong>
                  </div>
                </div>

                <div className="goal-progress">
                  <div className="goal-progress-top">
                    <span>
                      {Number(
                        goal.progressPercentage
                      ).toFixed(1)}
                      % complete
                    </span>

                    <span>
                      {goal.daysRemaining >=
                      0
                        ? `${goal.daysRemaining} days left`
                        : `${Math.abs(
                            goal.daysRemaining
                          )} days overdue`}
                    </span>
                  </div>

                  <div className="progress-track goal-progress-track">
                    <div
                      className={`progress-fill ${
                        goal.status ===
                        "completed"
                          ? "completed"
                          : goal.isOverdue
                            ? "exceeded"
                            : ""
                      }`}
                      style={{
                        width: `${Math.min(
                          Number(
                            goal.progressPercentage
                          ) || 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {goal.status ===
                  "active" && (
                  <div className="goal-plan">
                    <div>
                      <span>
                        Required monthly
                      </span>

                      <strong>
                        {formatCurrency(
                          goal.requiredMonthlyAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Required weekly
                      </span>

                      <strong>
                        {formatCurrency(
                          goal.requiredWeeklyAmount
                        )}
                      </strong>
                    </div>
                  </div>
                )}

                {goal.isOverdue &&
                  goal.status ===
                    "active" && (
                    <div className="goal-warning">
                      This goal is past its target
                      date. Update the target or
                      increase the saving pace.
                    </div>
                  )}

                {goal.status ===
                  "active" && (
                  <div className="goal-actions">
                    <div className="contribution-form">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Contribution"
                        value={
                          contributionAmounts[
                            goal._id
                          ] || ""
                        }
                        onChange={(event) =>
                          setContributionAmounts(
                            (current) => ({
                              ...current,
                              [goal._id]:
                                event.target.value,
                            })
                          )
                        }
                      />

                      <button
                        className="primary-button"
                        type="button"
                        disabled={
                          contributionLoading ===
                          goal._id
                        }
                        onClick={() =>
                          handleContribution(
                            goal._id
                          )
                        }
                      >
                        {contributionLoading ===
                        goal._id
                          ? "Adding..."
                          : "Add"}
                      </button>
                    </div>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        handleDeleteGoal(
                          goal._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                )}

                {goal.status !==
                  "active" && (
                  <div className="goal-actions">
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        handleDeleteGoal(
                          goal._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}