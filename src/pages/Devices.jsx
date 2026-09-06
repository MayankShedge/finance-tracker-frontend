import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/axios";

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

function getDaysRemaining(value) {
  if (!value) {
    return 0;
  }

  const expiresAt =
    new Date(value).getTime();

  const difference =
    expiresAt - Date.now();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
}

export default function Devices() {
  const [
    devices,
    setDevices,
  ] = useState([]);

  const [
    deviceName,
    setDeviceName,
  ] = useState("");

  const [
    generatedToken,
    setGeneratedToken,
  ] = useState("");

  const [
    generatedDevice,
    setGeneratedDevice,
  ] = useState(null);

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

  const [
    copied,
    setCopied,
  ] = useState(false);

  async function loadDevices() {
    setLoading(true);
    setError("");

    try {
      const { data } =
        await api.get(
          "/devices"
        );

      setDevices(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load connected devices"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
  }, []);

  async function handlePairDevice(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setGeneratedToken("");
    setGeneratedDevice(null);
    setCopied(false);
    setActionLoading(true);

    try {
      const { data } =
        await api.post(
          "/devices/pair",
          {
            name:
              deviceName.trim() ||
              "Android Companion",
          }
        );

      setGeneratedToken(
        data.deviceToken
      );

      setGeneratedDevice(
        data.device
      );

      setDeviceName("");

      setSuccessMessage(
        "Android companion credential created. Copy it now because it will not be shown again."
      );

      await loadDevices();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create device pairing"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCopyToken() {
    if (!generatedToken) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedToken
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      setError(
        "Could not copy the device token. Please copy it manually."
      );
    }
  }

  async function handleRevokeDevice(
    deviceId
  ) {
    const confirmed =
      window.confirm(
        "Revoking this device will stop it from sending notification events to your account. Continue?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await api.delete(
        `/devices/${deviceId}`
      );

      setSuccessMessage(
        "Device revoked successfully."
      );

      if (
        generatedDevice?._id ===
        deviceId
      ) {
        setGeneratedToken("");
        setGeneratedDevice(null);
      }

      await loadDevices();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not revoke device"
      );
    }
  }

  return (
    <div className="dashboard devices-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Personal Finance
          </p>

          <h1>
            Connected devices
          </h1>

          <p className="dashboard-subtitle">
            Connect an Android companion to automatically
            capture relevant payment notifications.
          </p>
        </div>

        <div className="header-actions">
          <Link
            className="secondary-button"
            to="/dashboard"
          >
            Back to dashboard
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

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Connect Android companion
            </h2>

            <p>
              Generate a device credential for the Android
              notification listener.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handlePairDevice
          }
          className="stacked-form"
        >
          <div className="device-pair-form">
            <label>
              Device name
              <input
                type="text"
                placeholder="My Android phone"
                value={deviceName}
                onChange={(event) =>
                  setDeviceName(
                    event.target.value
                  )
                }
                maxLength={100}
              />
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={
                actionLoading
              }
            >
              {actionLoading
                ? "Generating..."
                : "Generate pairing credential"}
            </button>
          </div>
        </form>
      </section>

      {generatedToken && (
        <section className="panel pairing-token-panel">
          <div className="panel-header">
            <div>
              <h2>
                Pairing credential
              </h2>

              <p>
                Give this credential to your Android
                companion now. It will not be displayed
                again after you leave this page.
              </p>
            </div>
          </div>

          <div className="pairing-warning">
            <strong>
              Keep this credential private.
            </strong>

            <span>
              Anyone who has it could send notification
              events to this device record until the
              credential expires or you revoke the device.
            </span>
          </div>

          <div className="pairing-token-box">
            <code>
              {generatedToken}
            </code>

            <button
              className="secondary-button"
              type="button"
              onClick={
                handleCopyToken
              }
            >
              {copied
                ? "Copied"
                : "Copy token"}
            </button>
          </div>

          {generatedDevice && (
            <div className="pairing-details">
              <div>
                <span>
                  Device
                </span>

                <strong>
                  {generatedDevice.name}
                </strong>
              </div>

              <div>
                <span>
                  Expires
                </span>

                <strong>
                  {formatDate(
                    generatedDevice.expiresAt
                  )}
                </strong>
              </div>
            </div>
          )}

          <div className="pairing-steps">
            <strong>
              Android setup
            </strong>

            <ol>
              <li>
                Install the Finance Tracker Android
                companion.
              </li>

              <li>
                Enter this pairing credential into the
                companion.
              </li>

              <li>
                Grant Notification Access when Android
                asks for it.
              </li>

              <li>
                Choose which payment/bank apps should be
                monitored.
              </li>
            </ol>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Your devices
            </h2>

            <p>
              Revoke a device at any time to stop it from
              sending notification events.
            </p>
          </div>

          <span className="panel-count">
            {devices.length}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading devices...
          </div>
        ) : devices.length === 0 ? (
          <div className="empty-state">
            No Android devices are connected yet.
          </div>
        ) : (
          <div className="device-list">
            {devices.map(
              (device) => {
                const daysRemaining =
                  getDaysRemaining(
                    device.expiresAt
                  );

                return (
                  <div
                    className="device-card"
                    key={
                      device._id
                    }
                  >
                    <div className="device-card-main">
                      <div className="device-icon">
                        A
                      </div>

                      <div>
                        <strong>
                          {device.name}
                        </strong>

                        <span>
                          Added{" "}
                          {formatDate(
                            device.createdAt
                          )}
                        </span>

                        <span>
                          Last seen:{" "}
                          {device.lastSeenAt
                            ? formatDate(
                                device.lastSeenAt
                              )
                            : "Not connected yet"}
                        </span>
                      </div>
                    </div>

                    <div className="device-card-meta">
                      <div>
                        <span>
                          Status
                        </span>

                        <strong
                          className={
                            device.active
                              ? "positive"
                              : "negative"
                          }
                        >
                          {device.active
                            ? "Active"
                            : "Revoked"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Expires
                        </span>

                        <strong>
                          {formatDate(
                            device.expiresAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Credential
                        </span>

                        <strong>
                          {daysRemaining > 0
                            ? `${daysRemaining} days`
                            : "Expired"}
                        </strong>
                      </div>
                    </div>

                    {device.active && (
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() =>
                          handleRevokeDevice(
                            device._id
                          )
                        }
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              How automatic capture works
            </h2>

            <p>
              Your web app remains the main application.
            </p>
          </div>
        </div>

        <div className="device-flow">
          <div>
            <span className="device-flow-number">
              1
            </span>

            <div>
              <strong>
                Android listens
              </strong>

              <span>
                The companion receives relevant notification
                events from Android.
              </span>
            </div>
          </div>

          <div>
            <span className="device-flow-number">
              2
            </span>

            <div>
              <strong>
                Backend validates
              </strong>

              <span>
                The server authenticates the device and
                rejects unauthorized events.
              </span>
            </div>
          </div>

          <div>
            <span className="device-flow-number">
              3
            </span>

            <div>
              <strong>
                Transaction is created
              </strong>

              <span>
                Relevant payment notifications are parsed
                and converted into normal transactions.
              </span>
            </div>
          </div>

          <div>
            <span className="device-flow-number">
              4
            </span>

            <div>
              <strong>
                Web app stays in control
              </strong>

              <span>
                Dashboard, analytics, goals and the AI
                assistant continue to live in the web app.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}