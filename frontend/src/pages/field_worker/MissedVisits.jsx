import { BellRing, PhoneCall } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { fieldPatients } from "../../data/mockData";

export default function MissedVisits() {
  const missed = fieldPatients.filter((p) => p.due.toLowerCase().includes("missed"));
  return (
    <AppLayout role="field_worker" eyebrow="Dropout detector" title="Missed Visits" description="Beneficiaries who missed a scheduled contact are moved into a follow-up queue.">
      <Card title="Priority follow-up">
        <div className="list">
          {missed.map((p) => (
            <div className="list-row roomy" key={p.id}>
              <BellRing size={18}/>
              <div><strong>{p.name}</strong><span>{p.due} • {p.reason}</span></div>
              <button className="mini-btn"><PhoneCall size={14}/> Call</button>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
}
