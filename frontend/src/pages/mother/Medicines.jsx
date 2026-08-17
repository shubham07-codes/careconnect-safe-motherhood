import { BellRing, Check, Pill } from "lucide-react";
import { useState } from "react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { medicines as initial } from "../../data/mockData";

export default function Medicines() {
  const [items, setItems] = useState(initial);

  const toggle = (id) => setItems(items.map((m) => m.id === id ? { ...m, done: !m.done } : m));

  return (
    <AppLayout role="mother" eyebrow="Medication support" title="Medicines" description="Track medicine times and mark doses as taken.">
      <section className="content-grid two">
        <Card title="Today's medicines">
          <div className="medicine-cards">
            {items.map((m) => (
              <div className="medicine-card" key={m.id}>
                <div className="medicine-icon"><Pill size={19}/></div>
                <div><strong>{m.name}</strong><span>{m.instruction}</span><small>{m.time}</small></div>
                <button className={m.done ? "taken-btn" : "mark-btn"} onClick={() => toggle(m.id)}>
                  {m.done ? <><Check size={15}/> Taken</> : "Mark taken"}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Reminder settings">
          <div className="notice"><BellRing size={20}/><div><strong>Notifications enabled</strong><p>Prototype reminders are shown in-app. SMS/WhatsApp will be handled by the backend reminder engine.</p></div></div>
        </Card>
      </section>
    </AppLayout>
  );
}
