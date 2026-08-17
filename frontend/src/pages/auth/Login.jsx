import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Logo from "../../components/common/Logo";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [splash, setSplash] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "asha@careconnect.demo",
    password: "Demo@123",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (splash) {
    return <Loader fullScreen />;
  }

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Real FastAPI login
      const user = await login(form.email, form.password);

      console.log("Logged in user:", user);

      // Backend role ke according dashboard
      const roleRoutes = {
        mother: "/mother",
        field_worker: "/field-worker",
        doctor: "/doctor",
        officer: "/officer",
      };

      const destination = roleRoutes[user.role];

      if (!destination) {
        setError("Invalid user role.");
        return;
      }

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to access this account.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to connect to CareConnect server. Please check if backend is running."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      {/* LEFT SIDE */}
      <section className="auth-hero">
        <Logo />

        <div className="hero-copy">
          <span className="soft-pill">
            Continuum of care
          </span>

          <h1>
            Safer pregnancy care,{" "}
            <em>
              connected from registration to newborn follow-up.
            </em>
          </h1>

          <p>
            Digital pregnancy registry, ANC due-lists,
            hybrid high-risk triage, referrals,
            multilingual reminders, postnatal care
            and newborn tracking.
          </p>

          <div className="hero-grid">
            <div>
              <b>01</b>

              <strong>
                Early risk detection
              </strong>

              <span>
                Rule-based + ML triage
              </span>
            </div>

            <div>
              <b>02</b>

              <strong>
                Smart due-lists
              </strong>

              <span>
                ANC & follow-up tracking
              </span>
            </div>

            <div>
              <b>03</b>

              <strong>
                Connected care
              </strong>

              <span>
                Mother → ASHA → Doctor
              </span>
            </div>
          </div>
        </div>

        <div className="blob blob-a" />
        <div className="blob blob-b" />
      </section>

      {/* RIGHT SIDE */}
      <section className="auth-panel">
        <form
          className="auth-card"
          onSubmit={submit}
        >
          <div className="mobile-logo">
            <Logo />
          </div>

          <span className="soft-pill">
            Secure access
          </span>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to your CareConnect workspace.
          </p>

          {/* NAME */}
          <label>
            Name{" "}
            <small>
              (optional)
            </small>

            <div className="field">
              <input
                type="text"
                value={form.name}
                placeholder="e.g. Priya Sharma"
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </label>

          {/* EMAIL */}
          <label>
            Email address

            <div className="field">
              <Mail size={17} />

              <input
                type="email"
                value={form.email}
                placeholder="Enter your email"
                autoComplete="email"
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            </div>
          </label>

          {/* PASSWORD */}
          <label>
            Password

            <div className="field">
              <LockKeyhole size={17} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                placeholder="Enter password"
                autoComplete="current-password"
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </label>

          {/* ERROR */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            className="primary-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <>
                Sign in
                <ArrowRight size={17} />
              </>
            )}
          </button>

          <div className="divider">
            <span>
              or
            </span>
          </div>

          <Link
            className="outline-btn"
            to="/register"
          >
            Create demo account
          </Link>

          <small className="demo-copy">
            Secure authentication powered by the
            CareConnect FastAPI backend.
          </small>
        </form>
      </section>
    </main>
  );
}