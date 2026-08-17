import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { wardRows } from "../../data/mockData";

export default function WardAnalytics() {
  return (
    <AppLayout role="officer" eyebrow="Ward comparison" title="Ward Analytics" description="Aggregate, de-identified ward-level monitoring.">
      <Card title="Ward comparison">
        <div className="table-wrap"><table><thead><tr><th>Ward</th><th>Pregnancies</th><th>High-risk</th><th>ANC coverage</th><th>Institutional delivery</th><th>Immunization</th></tr></thead>
        <tbody>{wardRows.map((w)=><tr key={w.ward}><td><strong>{w.ward}</strong></td><td>{w.pregnancies}</td><td>{w.highRisk}</td><td>{w.anc}%</td><td>{w.delivery}%</td><td>{w.immunization}%</td></tr>)}</tbody></table></div>
      </Card>
    </AppLayout>
  );
}
