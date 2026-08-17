import { Baby, HeartPulse } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

export default function PostnatalCases() {
  const rows = [
    ["Sunita Pawar","PNC Day 3","Mother stable","Newborn 2.7 kg","On track"],
    ["Farida Khan","PNC Day 7","BP review","Newborn 2.3 kg","Follow-up"],
    ["Rina More","PNC Day 14","Stable","Immunization due","On track"],
  ];
  return (
    <AppLayout role="doctor" eyebrow="Continuum beyond delivery" title="Postnatal & Newborn" description="PNC, low-birth-weight follow-up and newborn care tracking.">
      <Card title="Active postnatal cases">
        <div className="table-wrap"><table><thead><tr><th>Mother</th><th>Stage</th><th>Maternal note</th><th>Newborn</th><th>Status</th></tr></thead><tbody>{rows.map((r)=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td><HeartPulse size={14}/> {r[1]}</td><td>{r[2]}</td><td><Baby size={14}/> {r[3]}</td><td><em className={`badge ${r[4]==="On track"?"success":"warning"}`}>{r[4]}</em></td></tr>)}</tbody></table></div>
      </Card>
    </AppLayout>
  );
}
