import { CalendarClock } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { fieldPatients } from "../../data/mockData";

export default function ANCDueList() {
  return (
    <AppLayout role="field_worker" eyebrow="Due-list engine" title="ANC Due List" description="Daily worklist generated from pregnancy registration and ANC schedule.">
      <Card title="Today's due beneficiaries">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Beneficiary</th><th>Gestation</th><th>Contact</th><th>Due</th><th>Priority</th><th></th></tr></thead>
            <tbody>
              {fieldPatients.filter((p) => p.due.includes("Today")).map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><span>{p.id}</span></td><td>{p.week} weeks</td><td>{p.anc}</td><td>{p.due}</td>
                  <td><em className={`badge ${p.risk === "High" ? "danger" : "warning"}`}>{p.risk}</em></td>
                  <td><button className="mini-btn"><CalendarClock size={14}/> Record visit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
