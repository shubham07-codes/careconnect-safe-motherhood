import {
  Activity, Baby, Bell, CalendarDays, ClipboardList, HeartPulse,
  Home, LogOut, MapPinned, Pill, Salad, ShieldCheck, Stethoscope, Users
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";

const roleMeta = {
  mother: {
    label: "Mother",
    base: "/mother",
    links: [
      [Home, "Dashboard", ""],
      [HeartPulse, "My Pregnancy", "/pregnancy"],
      [CalendarDays, "ANC Calendar", "/anc-calendar"],
      [Pill, "Medicines", "/medicines"],
      [Salad, "Nutrition", "/nutrition"],
      [ClipboardList, "Reports", "/reports"],
      [Baby, "Baby & Newborn", "/newborn"],
      [Bell, "Reminders", "/reminders"],
    ],
  },
  field_worker: {
    label: "ANM / ASHA",
    base: "/field-worker",
    links: [
      [Home, "Dashboard", ""],
      [Users, "Beneficiaries", "/patients"],
      [CalendarDays, "ANC Due List", "/anc-due"],
      [Activity, "High-Risk Queue", "/high-risk"],
      [Bell, "Missed Visits", "/missed-visits"],
      [ClipboardList, "Follow-ups", "/follow-ups"],
      [Stethoscope, "Referrals", "/referrals"],
    ],
  },
  doctor: {
    label: "Doctor",
    base: "/doctor",
    links: [
      [Home, "Dashboard", ""],
      [Users, "Patients", "/patients"],
      [Activity, "High-Risk Cases", "/high-risk"],
      [ClipboardList, "Reports", "/reports"],
      [CalendarDays, "Appointments", "/appointments"],
      [Stethoscope, "Referrals", "/referrals"],
      [Baby, "Postnatal & Newborn", "/postnatal"],
    ],
  },
  officer: {
    label: "Health Officer",
    base: "/officer",
    links: [
      [Home, "Dashboard", ""],
      [ShieldCheck, "MCH Indicators", "/indicators"],
      [MapPinned, "Ward Analytics", "/wards"],
      [Activity, "Risk Overview", "/risk"],
      [Baby, "Immunization", "/immunization"],
    ],
  },
};

export default function AppLayout({ role, title, eyebrow, description, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const meta = roleMeta[role];

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />

        <div className="profile-mini">
          <div className="avatar">{(user?.name || "C")[0].toUpperCase()}</div>
          <div>
            <strong>{user?.name || "Demo User"}</strong>
            <span>{meta.label}</span>
          </div>
        </div>

        <nav>
          {meta.links.map(([Icon, label, suffix]) => {
            const to = `${meta.base}${suffix}`;
            return (
              <NavLink
                key={label}
                to={to}
                end={suffix === ""}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="signout" onClick={signOut}>
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {description && <p className="subtext">{description}</p>}
          </div>

          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
              <span>3</span>
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
