import { AlertTriangle } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { fieldPatients } from "../../data/mockData";

export default function HighRiskCases() {
  const high = fieldPatients.filter((p) => p.risk === "High");
  return (
    <AppLayout role="field_worker" eyebrow="Risk triage" title="High-Risk Queue" description="Prioritised cases for follow-up and referral.">
      <div className="risk-cards">
        {high.map((p) => (
          <Card key={p.id}>
            <div className="risk-card-head"><AlertTriangle size={20}/><em className="badge danger">High risk</em></div>
            <h3>{p.name}</h3><p>{p.week} weeks • {p.id}</p>
            <div className="risk-reason"><span>Why flagged</span><strong>{p.reason}</strong></div>
            <button className="primary-small full">Start follow-up</button>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
