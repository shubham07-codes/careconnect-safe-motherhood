import { ArrowRight, Baby, HeartHandshake, ShieldCheck, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import { useAuth } from "../../context/AuthContext";

const roles = [
  { id: "mother", title: "Mother", subtitle: "Pregnancy & newborn care", Icon: Baby, route: "/mother", text: "ANC calendar, reminders, medicines, reports, symptoms, postnatal care and newborn immunization." },
  { id: "field_worker", title: "ANM / ASHA", subtitle: "Field worker workspace", Icon: HeartHandshake, route: "/field-worker", text: "Pregnancy registration, daily due-lists, missed visits, high-risk follow-up and referrals." },
  { id: "doctor", title: "Doctor", subtitle: "Clinical workspace", Icon: Stethoscope, route: "/doctor", text: "High-risk review, reports, referral decisions, care plans and postnatal/newborn follow-up." },
  { id: "officer", title: "Health Officer", subtitle: "Ward-level intelligence", Icon: ShieldCheck, route: "/officer", text: "Aggregate ANC, risk, delivery, postnatal and immunization indicators without patient-level data." },
];

export default function RoleSelection() {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();

  const choose = (role) => {
    selectRole(role.id);
    navigate(role.route);
  };

  return (
    <main className="role-page">
      <header><Logo /></header>
      <section className="role-content">
        <span className="soft-pill">Welcome, {user?.name || "Demo User"}</span>
        <h1>Choose your workspace</h1>
        <p>Select a role to explore the CareConnect prototype.</p>

        <div className="role-grid">
          {roles.map((role) => (
            <button key={role.id} className={`role-card ${role.id}`} onClick={() => choose(role)}>
              <div className="role-icon"><role.Icon size={27}/></div>
              <span>{role.subtitle}</span>
              <h2>{role.title}</h2>
              <p>{role.text}</p>
              <div>Continue <ArrowRight size={17}/></div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
