import {
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/axios";

export default function ImportTransactions() {
  const fileInputRef =
    useRef(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(null);

  function handleFileChange(
    event
  ) {
    setError("");
    setSuccess(null);

    const file =
      event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setSelectedFile(null);

      setError(
        "Please select a CSV file."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setSelectedFile(null);

      setError(
        "The maximum file size is 5 MB."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    setSuccess(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  async function handleUpload(
    event
  ) {
    event.preventDefault();

    if (!selectedFile) {
      setError(
        "Please select a CSV file first."
      );
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(null);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const { data } =
        await api.post(
          "/import/transactions",
          formData
        );

      setSuccess({
        message:
          data.message ||
          "Transactions imported successfully.",

        importedCount:
          data.importedCount || 0,

        budgetAlerts:
          data.budgetAlerts || [],
      });

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not import transactions."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="dashboard import-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Personal Finance
          </p>

          <h1>
            Import transactions
          </h1>

          <p className="dashboard-subtitle">
            Upload a CSV statement and add the
            transactions to your account.
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
              to="/import"
            >
              Import
            </Link>
          </nav>
        </div>
      </header>

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {success && (
        <div className="message success">
          <strong>
            {success.message}
          </strong>

          <span>
            {success.importedCount}{" "}
            transaction
            {success.importedCount !==
            1
              ? "s"
              : ""}{" "}
            imported.
          </span>
        </div>
      )}

      <section className="panel import-panel">
        <div className="panel-header">
          <div>
            <h2>
              Upload CSV
            </h2>

            <p>
              Maximum file size: 5 MB.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handleUpload
          }
          className="import-form"
        >
          <div className="file-drop-area">
            <input
              ref={fileInputRef}
              id="transaction-csv"
              type="file"
              accept=".csv,text/csv"
              onChange={
                handleFileChange
              }
              disabled={uploading}
            />

            <label
              htmlFor="transaction-csv"
              className="file-select-button"
            >
              Choose CSV file
            </label>

            {selectedFile ? (
              <div className="selected-file">
                <div>
                  <strong>
                    {selectedFile.name}
                  </strong>

                  <span>
                    {(
                      selectedFile.size /
                      1024
                    ).toFixed(1)}{" "}
                    KB
                  </span>
                </div>

                <button
                  type="button"
                  className="secondary-button small-button"
                  onClick={
                    clearSelectedFile
                  }
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            ) : (
              <p>
                Select a CSV containing your
                transaction history.
              </p>
            )}
          </div>

          <button
            className="primary-button import-submit"
            type="submit"
            disabled={
              uploading ||
              !selectedFile
            }
          >
            {uploading
              ? "Importing..."
              : "Import transactions"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              Supported CSV formats
            </h2>

            <p>
              The importer handles common bank
              statement column layouts.
            </p>
          </div>
        </div>

        <div className="csv-format-grid">
          <div className="csv-format-card">
            <h3>
              Amount + Type
            </h3>

            <code>
              Date,Type,Amount,Category,Merchant,Description
            </code>

            <p>
              Example: expense + 450, or income
              + 75000.
            </p>
          </div>

          <div className="csv-format-card">
            <h3>
              Debit + Credit
            </h3>

            <code>
              Date,Debit,Credit,Description
            </code>

            <p>
              Debit becomes an expense and
              Credit becomes income.
            </p>
          </div>
        </div>
      </section>

      <section className="panel import-info-panel">
        <div className="panel-header">
          <div>
            <h2>
              Before importing
            </h2>
          </div>
        </div>

        <div className="import-info-list">
          <div>
            <strong>
              Your transactions
            </strong>

            <span>
              Imported transactions belong to your
              authenticated account.
            </span>
          </div>

          <div>
            <strong>
              Category
            </strong>

            <span>
              If the CSV doesn't contain a category,
              the transaction is added as
              "Uncategorized".
            </span>
          </div>

          <div>
            <strong>
              Duplicate detection
            </strong>

            <span>
              This first version does not automatically
              detect duplicate transactions.
            </span>
          </div>

          <div>
            <strong>
              Budget status
            </strong>

            <span>
              Budget usage is recalculated after the
              import completes.
            </span>
          </div>
        </div>
      </section>

      {success?.budgetAlerts?.length >
        0 && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>
                Budget alerts
              </h2>

              <p>
                Your imported transactions changed
                one or more budget statuses.
              </p>
            </div>
          </div>

          <div className="alerts">
            {success.budgetAlerts.map(
              (alert) => (
                <div
                  className={`alert ${alert.status}`}
                  key={String(
                    alert.budgetId
                  )}
                >
                  {alert.status ===
                  "exceeded"
                    ? "Over"
                    : "Nearing"}{" "}
                  your {alert.period}{" "}
                  {alert.category} budget:
                  spent{" "}
                  {alert.spent} of{" "}
                  {alert.limit}
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}