export default function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <article className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <button className="text-btn">{action}</button>}
        </div>
      )}
      {children}
    </article>
  );
}
