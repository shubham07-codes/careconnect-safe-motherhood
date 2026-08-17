import { AlertTriangle, CalendarCheck, CheckCircle2, Clock3 } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import { fieldPatients } from "../../data/mockData";

export default function FieldWorkerDashboard() {
  return (
    <AppLayout role="field_worker" eyebrow="ANM / ASHA workspace" title="Today's Field Plan" description="Prioritised ANC due-list, high-risk follow-ups and missed visits.">
      <section className="stat-grid four">
        <StatCard icon={CalendarCheck} label="ANC due today" value="18" hint="Assigned catchment"/>
        <StatCard icon={AlertTriangle} label="High-risk" value="7" hint="3 priority today" tone="pink"/>
        <StatCard icon={Clock3} label="Missed visits" value="5" hint="Follow-up needed" tone="orange"/>
        <StatCard icon={CheckCircle2} label="Completed" value="12" hint="Today's visits" tone="green"/>
      </section>

      <section className="content-grid two-one">
        <Card title="Priority due-list" action="View all">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Beneficiary</th><th>ANC</th><th>Due</th><th>Risk</th><th></th></tr></thead>
              <tbody>
                {fieldPatients.slice(0,4).map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><span>{p.week} weeks • {p.id}</span></td>
                    <td>{p.anc}</td><td>{p.due}</td>
                    <td><em className={`badge ${p.risk === "High" ? "danger" : p.risk === "Moderate" ? "warning" : "success"}`}>{p.risk}</em></td>
                    <td><button className="mini-btn">Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Priority actions">
          <div className="action-list">
            <button><strong>Register pregnancy</strong><span>Create early pregnancy record</span></button>
            <button><strong>Record ANC visit</strong><span>Vitals + ANC completion</span></button>
            <button><strong>Create referral</strong><span>Escalate high-risk case</span></button>
            <button><strong>Sync offline data</strong><span>Prototype offline-first workflow</span></button>
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
