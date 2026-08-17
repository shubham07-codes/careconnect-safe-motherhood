import { AlertTriangle, ShieldCheck } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { wardRows } from "../../data/mockData";

export default function RiskOverview() {
  return (
    <AppLayout role="officer" eyebrow="Risk intelligence" title="High-Risk Load" description="Only aggregate counts and percentages are shown in the officer view.">
      <section className="risk-cards">
        {wardRows.map((w)=><Card key={w.ward}><div className="risk-card-head"><AlertTriangle size={20}/><em className="badge warning">{w.highRisk} cases</em></div><h3>{w.ward}</h3><p>{w.pregnancies} active pregnancies</p><div className="metric-track"><b style={{width:`${Math.min(100,(w.highRisk/w.pregnancies)*300)}%`}}/></div><small>{((w.highRisk/w.pregnancies)*100).toFixed(1)}% high-risk load</small></Card>)}
      </section>
      <div className="notice top-gap"><ShieldCheck size={20}/><div><strong>DPDP-oriented design</strong><p>No patient names, phone numbers or individual medical records are displayed on this dashboard.</p></div></div>
    </AppLayout>
  );
}
