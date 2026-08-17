export default function Logo({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <img
        src={
          compact
            ? "/careconnect-icon.png"
            : "/careconnect-logo.png"
        }
        alt="CareConnect - Safe Motherhood"
      />
    </div>
  );
}