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

export default function Signup() {
  const { user, login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const slow = useSlowHint(submitting);

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
      const { data } = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      login(data);
    } catch (err) {
      setError(getAuthError(err, "Could not create your account. Try again."));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up takes about a minute."
      panelTitle="A clearer view of your money, from the first transaction."
      points={[
        "Add transactions by hand or import a CSV statement",
        "Set a budget and see when you're close to the limit",
        "Save toward goals and track your progress",
      ]}
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth-fields" onSubmit={handleSubmit}>
        <FormStatus error={error} slow={slow} />

        <Field
          id="signup-name"
          label="Name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
        />

        <Field
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
        />

        <PasswordField
          id="signup-password"
          label="Password"
          hint="At least 6 characters."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={6}
        />

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}