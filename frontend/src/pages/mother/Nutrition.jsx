import { Apple, Clock3, Salad } from "lucide-react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import { meals } from "../../data/mockData";

export default function Nutrition() {
  return (
    <AppLayout role="mother" eyebrow="Nutrition guidance" title="Today's Nutrition Plan" description="Clinician-governed meal guidance for the prototype profile.">
      <section className="content-grid two">
        <Card title="Meal schedule">
          <div className="meal-cards">
            {meals.map((m) => (
              <div className="meal-card" key={m.id}>
                <div><Salad size={19}/></div>
                <span><strong>{m.name}</strong><small>{m.items}</small></span>
                <time><Clock3 size={13}/>{m.time}</time>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Nutrition note">
          <div className="notice green"><Apple size={21}/><div><strong>Personalization rule</strong><p>Food guidance should consider trimester, clinician instructions, allergies and flagged conditions. The AI should not independently prescribe treatment.</p></div></div>
        </Card>
      </section>
    </AppLayout>
  );
}
