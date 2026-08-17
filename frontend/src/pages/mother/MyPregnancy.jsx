import { Activity, CalendarDays, HeartPulse, Scale } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import { motherProfile } from "../../data/mockData";

export default function MyPregnancy() {
  return (
    <AppLayout role="mother" eyebrow="Pregnancy profile" title="My Pregnancy" description="A simple view of your pregnancy journey and recorded health values.">
      <section className="stat-grid four">
        <StatCard icon={CalendarDays} label="Current week" value="28" hint={motherProfile.trimester}/>
        <StatCard icon={HeartPulse} label="Blood pressure" value="110/72" hint="Last recorded"/>
        <StatCard icon={Scale} label="Weight" value="61.2 kg" hint="Latest ANC"/>
        <StatCard icon={Activity} label="Hemoglobin" value="11.2" hint="g/dL • last report" tone="pink"/>
      </section>

      <section className="content-grid two">
        <Card title="Pregnancy details">
          <div className="detail-grid">
            <div><span>Expected delivery</span><strong>{motherProfile.edd}</strong></div>
            <div><span>Blood group</span><strong>{motherProfile.bloodGroup}</strong></div>
            <div><span>Care facility</span><strong>{motherProfile.facility}</strong></div>
            <div><span>Contact</span><strong>{motherProfile.phone}</strong></div>
          </div>
        </Card>

        <Card title="Risk summary">
          <div className="risk-panel moderate">
            <strong>Moderate risk</strong>
            <p>This prototype uses synthetic values. Any real clinical decision must be made by a qualified healthcare professional.</p>
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
