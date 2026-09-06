import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getCurrentPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
} from "../utils/pushNotifications";

export default function ReminderSettings() {
  const [
    subscribed,
    setSubscribed,
  ] = useState(false);

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

  async function loadStatus() {
    setLoading(true);
    setError("");

    try {
      const subscription =
        await getCurrentPushSubscription();

      setSubscribed(
        Boolean(subscription)
      );
    } catch (err) {
      setError(
        err.message ||
          "Could not determine notification status."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleEnable() {
    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await subscribeToPush();

      setSubscribed(true);

      setSuccessMessage(
        "Browser reminders are enabled."
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          err.message ||
          "Could not enable reminders."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisable() {
    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await unsubscribeFromPush();

      setSubscribed(false);

      setSuccessMessage(
        "Browser reminders are disabled."
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          err.message ||
          "Could not disable reminders."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTest() {
    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await sendTestPush();

      setSuccessMessage(
        "Test notification sent."
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Could not send test notification."
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="dashboard reminder-settings-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Personal Productivity
          </p>

          <h1>
            Reminder settings
          </h1>

          <p className="dashboard-subtitle">
            Control browser notifications for your task
            reminders.
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
              to="/tasks"
            >
              Tasks
            </Link>

            <Link
              className="nav-link active"
              to="/reminders"
            >
              Reminders
            </Link>
          </nav>
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

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Browser notifications
            </h2>

            <p>
              Receive reminders even when the Finance
              Tracker tab is closed.
            </p>
          </div>

          <span
            className={`status-badge ${
              subscribed
                ? "active"
                : "archived"
            }`}
          >
            {loading
              ? "Checking"
              : subscribed
                ? "Enabled"
                : "Disabled"}
          </span>
        </div>

        <div className="reminder-status-card">
          <div>
            <strong>
              {subscribed
                ? "Browser reminders are enabled."
                : "Browser reminders are disabled."}
            </strong>

            <span>
              {subscribed
                ? "Tasks with a reminder time can now trigger browser notifications."
                : "Enable notifications to receive scheduled task reminders."}
            </span>
          </div>

          <div className="reminder-setting-actions">
            {subscribed ? (
              <>
                <button
                  className="primary-button"
                  type="button"
                  onClick={
                    handleTest
                  }
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Working..."
                    : "Send test"}
                </button>

                <button
                  className="danger-button"
                  type="button"
                  onClick={
                    handleDisable
                  }
                  disabled={
                    actionLoading
                  }
                >
                  Disable
                </button>
              </>
            ) : (
              <button
                className="primary-button"
                type="button"
                onClick={
                  handleEnable
                }
                disabled={
                  actionLoading ||
                  loading
                }
              >
                {actionLoading
                  ? "Enabling..."
                  : "Enable browser reminders"}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              How reminders work
            </h2>
          </div>
        </div>

        <div className="reminder-flow">
          <div>
            <span>
              1
            </span>

            <div>
              <strong>
                Create a task
              </strong>

              <p>
                Set a due date and enable a reminder.
              </p>
            </div>
          </div>

          <div>
            <span>
              2
            </span>

            <div>
              <strong>
                Server finds due reminders
              </strong>

              <p>
                A scheduler periodically asks the backend
                to process reminders that are due.
              </p>
            </div>
          </div>

          <div>
            <span>
              3
            </span>

            <div>
              <strong>
                Browser receives push
              </strong>

              <p>
                The service worker receives the push and
                displays the reminder notification.
              </p>
            </div>
          </div>

          <div>
            <span>
              4
            </span>

            <div>
              <strong>
                Reminder is marked sent
              </strong>

              <p>
                The backend records the successful
                delivery so the same task isn't repeatedly
                sent.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Important
            </h2>
          </div>
        </div>

        <div className="reminder-notes">
          <p>
            Browser notifications require permission from
            you.
          </p>

          <p>
            Production deployment must use HTTPS for Web
            Push.
          </p>

          <p>
            If notifications are disabled at the browser
            or operating-system level, scheduled reminders
            cannot be displayed there.
          </p>

          <p>
            You can still use tasks without enabling
            browser reminders.
          </p>
        </div>
      </section>
    </div>
  );
}