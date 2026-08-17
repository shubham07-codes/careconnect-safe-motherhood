import { Bell, CalendarDays, MessageCircle, Pill, Salad } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

export default function Reminders() {
  const items = [
    [Pill, "Medicine", "Calcium after lunch", "2:00 PM"],
    [Salad, "Meal", "Evening snack", "5:00 PM"],
    [CalendarDays, "ANC", "ANC follow-up", "28 May • 10:30 AM"],
    [MessageCircle, "Language", "Preferred reminder language", "Marathi"],
  ];

  return (
    <AppLayout role="mother" eyebrow="Reminder centre" title="Reminders" description="Medicine, meal and ANC reminders in one place.">
      <Card title="Upcoming reminders">
        <div className="reminder-grid">
          {items.map(([Icon, type, text, time]) => (
            <div className="reminder-card" key={type}>
              <div><Icon size={19}/></div>
              <span><small>{type}</small><strong>{text}</strong></span>
              <em>{time}</em>
            </div>
          ))}
        </div>
      </Card>

      <div className="notice top-gap"><Bell size={20}/><div><strong>Consent-aware reminders</strong><p>SMS/WhatsApp/IVR reminders should only be sent after recording beneficiary consent and preferred language/channel.</p></div></div>
    </AppLayout>
  );
}
