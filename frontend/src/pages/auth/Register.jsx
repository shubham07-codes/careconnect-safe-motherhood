import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || form.password.length < 6) return;
    register(form);
    navigate("/select-role");
  };

  return (
    <main className="centered-page">
      <form className="auth-card register-card" onSubmit={submit}>
        <Link to="/login" className="back-link"><ArrowLeft size={16}/> Back to login</Link>
        <Logo />
        <h2>Create demo account</h2>
        <p>Set up a prototype profile. No real patient data should be used.</p>

        {[
          ["Full name", "name", "text", "e.g. Priya Sharma"],
          ["Email", "email", "email", "name@example.com"],
          ["Phone", "phone", "tel", "+91"],
          ["Password", "password", "password", "Minimum 6 characters"],
        ].map(([label, key, type, placeholder]) => (
          <label key={key}>
            {label}
            <div className="field">
              <input
                required={key !== "phone"}
                minLength={key === "password" ? 6 : undefined}
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          </label>
        ))}

        <button className="primary-btn" type="submit">
          Continue <ArrowRight size={17}/>
        </button>
      </form>
    </main>
  );
}
