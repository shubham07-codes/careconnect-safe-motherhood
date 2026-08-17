export default function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <div><Icon size={24}/></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
