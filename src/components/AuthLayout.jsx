import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Brand({ className = "" }) {
  return (
    <Link to="/" className={`auth-brand ${className}`} aria-label="Finora home">
      <span className="auth-brand-mark">f</span>
      <span className="auth-brand-word">
        finora<span>.</span>
      </span>
    </Link>
  );
}

export function AuthLayout({
  title,
  subtitle,
  panelTitle,
  points,
  footer,
  children,
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Brand />

        <div className="auth-aside-body">
          <h2>{panelTitle}</h2>
          <ul>
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <p className="auth-aside-note">Personal finance, made smarter</p>
      </aside>

      <main className="auth-main">
        <div className="auth-panel">
          <Brand className="auth-brand-mobile" />

          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>

          {children}

          <p className="auth-switch">{footer}</p>
        </div>
      </main>
    </div>
  );
}

export function Field({ id, label, hint, ...inputProps }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} required {...inputProps} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function PasswordField({ id, label, hint, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>

      <div className="auth-password">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          {...inputProps}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {hint && <small>{hint}</small>}
    </div>
  );
}

export function FormStatus({ error, slow }) {
  return (
    <>
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      {slow && !error && (
        <div className="auth-slow" role="status">
          The server is waking up. The first request can take up to a minute.
        </div>
      )}
    </>
  );
}

/*
  The backend runs on a free host that sleeps when idle.
  If a request takes longer than a few seconds, tell the
  user why instead of leaving them on a silent spinner.
*/
export function useSlowHint(active, delay = 4000) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) {
      setSlow(false);
      return undefined;
    }

    const timer = setTimeout(() => setSlow(true), delay);

    return () => clearTimeout(timer);
  }, [active, delay]);

  return slow;
}

export function getAuthError(err, fallback) {
  if (!err.response) {
    return "Can't reach the server. Check your connection and try again.";
  }

  return err.response.data?.message || fallback;
}