import { AlertTriangle, BrainCircuit, ClipboardCheck } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { doctorPatients } from "../../data/mockData";

export default function HighRiskCases() {
  const rows = doctorPatients.filter((p) => p.risk === "High");
  return (
    <AppLayout role="doctor" eyebrow="Hybrid risk stratification" title="High-Risk Cases" description="Rule flags + ML risk score with explainable triage.">
      <div className="risk-cards doctor-risk">
        {rows.map((p) => (
          <Card key={p.id}>
            <div className="risk-card-head"><AlertTriangle size={20}/><em className="badge danger">{p.score}/100</em></div>
            <h3>{p.name}</h3><p>{p.week} weeks • {p.facility}</p>
            <div className="risk-reason"><span>Key reason</span><strong>{p.reason}</strong></div>
            <div className="split-note"><BrainCircuit size={17}/><span>Hybrid risk engine</span></div>
            <button className="primary-small full"><ClipboardCheck size={15}/> Review case</button>
          </Card>
        ))}
      </div>
      <div className="notice top-gap"><BrainCircuit size={20}/><div><strong>Clinical guardrail</strong><p>The model prioritizes cases; it does not replace clinician judgment. Final referral and treatment decisions remain with qualified professionals.</p></div></div>
    </AppLayout>
  );
}
