import { ArrowRight, Building2 } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

export default function Referrals() {
  const rows = [
    ["Priya Deshmukh","Health Post 3","UPHC Ward 12","Pending"],
    ["Sneha Patil","UPHC Ward 12","Maternity Hospital","Accepted"],
    ["Aarti Jadhav","UPHC Ward 8","District Hospital","Urgent"],
  ];
  return (
    <AppLayout role="doctor" eyebrow="Referral management" title="Referrals" description="Review, accept and track high-risk referrals.">
      <Card title="Referral pathway">
        <div className="referral-cards">
          {rows.map((r)=><div className="referral-card" key={r[0]}><div><strong>{r[0]}</strong><span>Maternal referral</span></div><div className="referral-flow"><span><Building2 size={14}/>{r[1]}</span><ArrowRight size={15}/><span><Building2 size={14}/>{r[2]}</span></div><em className={`badge ${r[3]==="Urgent"?"danger":r[3]==="Accepted"?"success":"warning"}`}>{r[3]}</em></div>)}
        </div>
      </Card>
    </AppLayout>
  );
}
