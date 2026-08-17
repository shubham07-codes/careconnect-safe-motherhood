import { AlertTriangle, CalendarDays, FileText, Users } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import { doctorPatients, reports } from "../../data/mockData";

export default function DoctorDashboard() {
  return (
    <AppLayout role="doctor" eyebrow="Clinical workspace" title="High-Risk Pregnancy Review" description="Review priority cases, reports and referrals.">
      <section className="stat-grid four">
        <StatCard icon={Users} label="Active patients" value="320" hint="Assigned catchment"/>
        <StatCard icon={AlertTriangle} label="High-risk" value="18" hint="Priority review" tone="pink"/>
        <StatCard icon={CalendarDays} label="Appointments" value="16" hint="Today" tone="blue"/>
        <StatCard icon={FileText} label="Reports pending" value="7" hint="Clinical review" tone="orange"/>
      </section>

      <section className="content-grid two-one">
        <Card title="High-risk priority queue">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Reason</th><th>Risk</th><th>Score</th><th></th></tr></thead>
              <tbody>
                {doctorPatients.filter((p) => p.risk !== "Low").map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><span>{p.week} weeks</span></td><td>{p.reason}</td>
                    <td><em className={`badge ${p.risk === "High" ? "danger" : "warning"}`}>{p.risk}</em></td>
                    <td><strong>{p.score}/100</strong></td><td><button className="mini-btn">Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Reports pending">
          <div className="list">
            {reports.slice(0,3).map((r) => (
              <div className="list-row" key={r.id}>
                <FileText size={17}/><div><strong>{r.type}</strong><span>{r.patient} • {r.date}</span></div><button className="mini-btn">Review</button>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
