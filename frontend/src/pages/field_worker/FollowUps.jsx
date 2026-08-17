import { CheckCircle2, MessageCircle, PhoneCall } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { reminders } from "../../data/mockData";

export default function FollowUps() {
  return (
    <AppLayout role="field_worker" eyebrow="Follow-up worklist" title="Follow-ups" description="Reminder delivery and field-contact status.">
      <Card title="Communication queue">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Beneficiary</th><th>Type</th><th>Channel</th><th>Language</th><th>Status</th></tr></thead>
            <tbody>
              {reminders.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.patient}</strong></td><td>{r.type}</td>
                  <td>{r.channel === "Call" ? <><PhoneCall size={13}/> {r.channel}</> : <><MessageCircle size={13}/> {r.channel}</>}</td>
                  <td>{r.language}</td>
                  <td><em className={`badge ${r.status === "Delivered" ? "success" : "warning"}`}>{r.status === "Delivered" && <CheckCircle2 size={12}/>} {r.status}</em></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
