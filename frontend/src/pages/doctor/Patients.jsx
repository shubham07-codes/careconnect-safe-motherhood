import { Search } from "lucide-react";
import { useState } from "react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { doctorPatients } from "../../data/mockData";

export default function Patients() {
  const [q, setQ] = useState("");
  const rows = doctorPatients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppLayout role="doctor" eyebrow="Patient registry" title="Patients" description="Synthetic pregnancy records for prototype demonstration.">
      <Card title="Assigned patients">
        <div className="toolbar"><div className="search-input"><Search size={16}/><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient"/></div></div>
        <div className="table-wrap">
          <table><thead><tr><th>ID</th><th>Patient</th><th>Week</th><th>Facility</th><th>Risk</th><th>Score</th></tr></thead>
          <tbody>{rows.map((p)=><tr key={p.id}><td>{p.id}</td><td><strong>{p.name}</strong><span>{p.reason}</span></td><td>{p.week}</td><td>{p.facility}</td><td><em className={`badge ${p.risk==="High"?"danger":p.risk==="Moderate"?"warning":"success"}`}>{p.risk}</em></td><td>{p.score}</td></tr>)}</tbody></table>
        </div>
      </Card>
    </AppLayout>
  );
}
