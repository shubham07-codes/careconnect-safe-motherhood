import { ArrowRight, Building2, Stethoscope } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

export default function Referrals() {
  const rows = [
    ["Priya Deshmukh","Health Post 3","UPHC Ward 12","High BP + low Hb","Pending"],
    ["Sneha Patil","UPHC Ward 12","Maternity Hospital","Diabetes flag","Accepted"],
    ["Aarti Jadhav","UPHC Ward 8","District Hospital","Severe anaemia flag","Urgent"],
  ];
  return (
    <AppLayout role="field_worker" eyebrow="Referral pathway" title="Referrals" description="Escalate high-risk cases to the appropriate level of care.">
      <Card title="Referral tracker">
        <div className="referral-cards">
          {rows.map((r) => (
            <div className="referral-card" key={r[0]}>
              <div><Stethoscope size={18}/><strong>{r[0]}</strong><span>{r[3]}</span></div>
              <div className="referral-flow"><span><Building2 size={14}/>{r[1]}</span><ArrowRight size={15}/><span><Building2 size={14}/>{r[2]}</span></div>
              <em className={`badge ${r[4] === "Urgent" ? "danger" : r[4] === "Accepted" ? "success" : "warning"}`}>{r[4]}</em>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
}
