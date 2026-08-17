import { Baby, HeartPulse, Syringe } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

export default function Newborn() {
  return (
    <AppLayout role="mother" eyebrow="Post-delivery care" title="Baby & Newborn" description="This section becomes active after delivery.">
      <section className="content-grid three">
        <Card title="Newborn profile">
          <div className="empty-mini"><Baby size={28}/><strong>Not active yet</strong><p>Newborn profile will be created after delivery.</p></div>
        </Card>
        <Card title="Postnatal visits">
          <div className="empty-mini"><HeartPulse size={28}/><strong>PNC schedule</strong><p>Postnatal follow-up due dates will appear here.</p></div>
        </Card>
        <Card title="Immunization">
          <div className="empty-mini"><Syringe size={28}/><strong>Vaccination due-list</strong><p>Newborn immunization schedule will be generated automatically.</p></div>
        </Card>
      </section>
    </AppLayout>
  );
}
