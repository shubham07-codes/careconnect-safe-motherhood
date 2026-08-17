import { CheckCircle2, Clock3 } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { ancVisits } from "../../data/mockData";

export default function ANCCalendar() {
  return (
    <AppLayout role="mother" eyebrow="ANC schedule" title="ANC Calendar" description="Your scheduled antenatal contacts and due dates.">
      <Card title="Antenatal care timeline">
        <div className="timeline-list">
          {ancVisits.map((v) => (
            <div className={`timeline-item ${v.status}`} key={v.id}>
              <div className="timeline-icon">
                {v.status === "completed" ? <CheckCircle2 size={18}/> : <Clock3 size={18}/>}
              </div>
              <div><strong>{v.title}</strong><span>{v.notes}</span></div>
              <time>{v.date}</time>
              <em className={`badge ${v.status === "completed" ? "success" : "info"}`}>{v.status}</em>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
}
