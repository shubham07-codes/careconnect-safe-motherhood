import { CalendarDays, Clock3 } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

export default function Appointments() {
  const rows = [
    ["09:30 AM","Priya Deshmukh","ANC review","Completed"],
    ["10:30 AM","Sneha Patil","High-risk follow-up","Upcoming"],
    ["11:30 AM","Kavita More","Routine ANC","Upcoming"],
    ["12:15 PM","Aarti Jadhav","Referral review","Urgent"],
  ];
  return (
    <AppLayout role="doctor" eyebrow="Clinical schedule" title="Appointments" description="Today's patient reviews and referral follow-ups.">
      <Card title="Today's schedule">
        <div className="appointment-list">
          {rows.map((r)=><div key={r[0]}><div><Clock3 size={17}/><strong>{r[0]}</strong></div><span><strong>{r[1]}</strong><small>{r[2]}</small></span><em className={`badge ${r[3]==="Completed"?"success":r[3]==="Urgent"?"danger":"info"}`}>{r[3]}</em><CalendarDays size={17}/></div>)}
        </div>
      </Card>
    </AppLayout>
  );
}
