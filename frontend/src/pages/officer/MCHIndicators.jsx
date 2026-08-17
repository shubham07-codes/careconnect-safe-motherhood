import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { wardIndicators } from "../../data/mockData";

export default function MCHIndicators() {
  return (
    <AppLayout role="officer" eyebrow="Programme indicators" title="MCH Indicators" description="Eight standard maternal and child health indicators for the prototype.">
      <div className="indicator-card-grid">
        {wardIndicators.map((i)=><Card key={i.label}><span className="metric-label">{i.label}</span><strong className="metric-big">{i.value}%</strong><div className="metric-track"><b style={{width:`${i.value}%`}}/></div></Card>)}
      </div>
    </AppLayout>
  );
}
