import { FileText } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { reports } from "../../data/mockData";

export default function Reports() {
  return (
    <AppLayout role="doctor" eyebrow="Report review" title="Medical Reports" description="Review uploaded lab reports and prescriptions.">
      <Card title="Review queue">
        <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Document</th><th>Date</th><th>Status</th><th></th></tr></thead>
        <tbody>{reports.map((r)=><tr key={r.id}><td><strong>{r.patient}</strong></td><td><FileText size={14}/> {r.type}</td><td>{r.date}</td><td><em className={`badge ${r.status==="Flagged"?"danger":r.status==="Reviewed"?"success":"warning"}`}>{r.status}</em></td><td><button className="mini-btn">Open</button></td></tr>)}</tbody></table></div>
      </Card>
    </AppLayout>
  );
}
