import { CalendarDays, FileText, HeartPulse, Pill, Salad, Upload } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";
import { meals, medicines, motherProfile } from "../../data/mockData";

export default function MotherDashboard() {
  const { user } = useAuth();

  return (
    <AppLayout
      role="mother"
      eyebrow="Mother workspace"
      title={`Good afternoon, ${user?.name || motherProfile.name} 👋`}
      description="Your pregnancy care plan, reminders and follow-ups in one place."
    >
      <section className="mother-summary glass">
        <div className="week-ring"><strong>{motherProfile.week}</strong><span>weeks</span></div>
        <div><small>Pregnancy stage</small><h2>{motherProfile.trimester}</h2><p>Expected delivery: {motherProfile.edd}</p></div>
        <div className="risk-box"><small>Current triage</small><strong>Moderate risk</strong><span>Follow scheduled care plan</span></div>
        <button className="danger-outline">Emergency help</button>
      </section>

      <section className="stat-grid three">
        <StatCard icon={CalendarDays} label="Next ANC" value="28 May" hint="10:30 AM • UPHC" />
        <StatCard icon={HeartPulse} label="Latest BP" value="110/72" hint="Recorded at last ANC" tone="blue" />
        <StatCard icon={FileText} label="Reports" value="3" hint="1 awaiting doctor review" tone="pink" />
      </section>

      <section className="content-grid three">
        <Card title="Medicine reminders">
          <div className="list">
            {medicines.map((m) => (
              <div className="list-row" key={m.id}>
                <Pill size={17}/>
                <div><strong>{m.name}</strong><span>{m.instruction}</span></div>
                <em className={`badge ${m.done ? "success" : "warning"}`}>{m.done ? "Taken" : m.time}</em>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Today's food plan">
          <div className="list">
            {meals.slice(0,3).map((m) => (
              <div className="list-row" key={m.id}>
                <Salad size={17}/>
                <div><strong>{m.name}</strong><span>{m.items}</span></div>
                <em className="time">{m.time}</em>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Medical documents" action="View all">
          <div className="upload-quick">
            <button><Upload size={18}/><span><strong>Upload prescription</strong><small>Photo or PDF</small></span></button>
            <button><FileText size={18}/><span><strong>Upload lab report</strong><small>Photo or PDF</small></span></button>
          </div>
        </Card>

        <Card title="Continuum of care" className="span-three">
          <div className="care-steps">
            {[
              ["1","Registered","Done"],
              ["2","ANC visits","Active"],
              ["3","Delivery","Upcoming"],
              ["4","Postnatal care","Later"],
              ["5","Newborn","Later"],
              ["6","Immunization","Later"],
            ].map(([n,t,s], i) => (
              <div className={i < 2 ? "done-step" : ""} key={t}>
                <b>{n}</b><strong>{t}</strong><span>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
