export default function StatCard({ icon: Icon, label, value, hint, tone = "teal" }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon"><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}
