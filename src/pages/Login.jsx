import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

import {
  AuthLayout,
  Field,
  FormStatus,
  PasswordField,
  getAuthError,
  useSlowHint,
} from "../components/AuthLayout";

export default function Login() {
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const slow = useSlowHint(submitting);

  // Already signed in: skip the form.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // Setting the user triggers the redirect above.
      login(data);
    } catch (err) {
      setError(getAuthError(err, "Login failed. Try again."));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your dashboard."
      panelTitle="Pick up where you left off."
      points={[
        "Your transactions, budgets and goals in one place",
        "Reminders for the tasks that are due",
        "An assistant that can answer questions about your spending",
      ]}
      footer={
        <>
          New to Finora? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      <form className="auth-fields" onSubmit={handleSubmit}>
        <FormStatus error={error} slow={slow} />

        <Field
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
        />

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}