import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import Logo from "../../components/common/Logo";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [splash, setSplash] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "demo@careconnect.in",
    password: "123456",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (splash) return <Loader fullScreen />;

  const submit = (e) => {
    e.preventDefault();
    if (!form.email || form.password.length < 6) {
      setError("Enter a valid email and a password with at least 6 characters.");
      return;
    }
    login(form);
    navigate("/select-role");
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <Logo />
        <div className="hero-copy">
          <span className="soft-pill">Continuum of care</span>
          <h1>Safer pregnancy care, <em>connected from registration to newborn follow-up.</em></h1>
          <p>
            Digital pregnancy registry, ANC due-lists, hybrid high-risk triage,
            referrals, multilingual reminders, postnatal care and newborn tracking.
          </p>

          <div className="hero-grid">
            <div><b>01</b><strong>Early risk detection</strong><span>Rule-based + ML triage</span></div>
            <div><b>02</b><strong>Smart due-lists</strong><span>ANC & follow-up tracking</span></div>
            <div><b>03</b><strong>Connected care</strong><span>Mother → ASHA → Doctor</span></div>
          </div>
        </div>
        <div className="blob blob-a" />
        <div className="blob blob-b" />
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <div className="mobile-logo"><Logo /></div>
          <span className="soft-pill">Secure access</span>
          <h2>Welcome back</h2>
          <p>Sign in to your CareConnect workspace.</p>

          <label>
            Name <small>(optional for demo)</small>
            <div className="field">
              <input
                value={form.name}
                placeholder="e.g. Priya Sharma"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </label>

          <label>
            Email address
            <div className="field">
              <Mail size={17} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </label>

          <label>
            Password
            <div className="field">
              <LockKeyhole size={17} />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
              </button>
            </div>
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-btn" type="submit">
            Sign in <ArrowRight size={17}/>
          </button>

          <div className="divider"><span>or</span></div>

          <Link className="outline-btn" to="/register">Create demo account</Link>
          <small className="demo-copy">Demo credentials are pre-filled. Real authentication will be connected to FastAPI later.</small>
        </form>
      </section>
    </main>
  );
}
