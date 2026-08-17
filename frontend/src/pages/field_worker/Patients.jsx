import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { fieldPatients } from "../../data/mockData";

export default function Patients() {
  const [query, setQuery] = useState("");
  const filtered = fieldPatients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppLayout role="field_worker" eyebrow="Beneficiary registry" title="Pregnancy Registry" description="Synthetic records only for the hackathon prototype.">
      <Card title="Registered beneficiaries" action="Register new">
        <div className="toolbar">
          <div className="search-input"><Search size={16}/><input placeholder="Search by name or CareConnect ID" value={query} onChange={(e) => setQuery(e.target.value)}/></div>
          <button className="primary-small"><UserPlus size={16}/> Register pregnancy</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Week</th><th>Ward</th><th>Risk</th><th>Next action</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td><td><strong>{p.name}</strong><span>{p.reason}</span></td><td>{p.week}</td><td>{p.ward}</td>
                  <td><em className={`badge ${p.risk === "High" ? "danger" : p.risk === "Moderate" ? "warning" : "success"}`}>{p.risk}</em></td>
                  <td>{p.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
