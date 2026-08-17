import { Activity, Baby, CheckCircle2, HeartPulse } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import { wardIndicators, wardRows } from "../../data/mockData";

export default function OfficerDashboard() {
  return (
    <AppLayout role="officer" eyebrow="Aggregate-only ward intelligence" title="Maternal & Child Health Overview" description="De-identified indicators for programme monitoring.">
      <section className="stat-grid four">
        <StatCard icon={HeartPulse} label="ANC coverage" value="91%" hint="Registered pregnancies"/>
        <StatCard icon={Activity} label="High-risk load" value="12.4%" hint="Across wards" tone="pink"/>
        <StatCard icon={CheckCircle2} label="Institutional delivery" value="96%" hint="This quarter" tone="green"/>
        <StatCard icon={Baby} label="Full immunization" value="88%" hint="Eligible newborns" tone="blue"/>
      </section>

      <section className="content-grid two-one">
        <Card title="MCH indicators">
          <div className="indicator-list">
            {wardIndicators.map((i)=><div key={i.label}><span>{i.label}</span><div><b style={{width:`${i.value}%`}}/></div><strong>{i.value}%</strong></div>)}
          </div>
        </Card>
        <Card title="Highest risk load">
          <div className="ward-mini">
            {wardRows.slice(0,3).map((w)=><div key={w.ward}><span><strong>{w.ward}</strong><small>{w.pregnancies} pregnancies</small></span><em className="badge warning">{((w.highRisk/w.pregnancies)*100).toFixed(1)}%</em></div>)}
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
