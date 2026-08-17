import { Baby, Syringe } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { wardRows } from "../../data/mockData";

export default function ImmunizationOverview() {
  return (
    <AppLayout role="officer" eyebrow="Newborn programme tracking" title="Immunization Overview" description="Aggregate newborn immunization coverage by ward.">
      <Card title="Ward immunization coverage">
        <div className="ward-immunization">
          {wardRows.map((w)=><div key={w.ward}><div><Baby size={17}/><span><strong>{w.ward}</strong><small>Eligible newborn cohort</small></span></div><div className="metric-track"><b style={{width:`${w.immunization}%`}}/></div><strong><Syringe size={14}/>{w.immunization}%</strong></div>)}
        </div>
      </Card>
    </AppLayout>
  );
}
