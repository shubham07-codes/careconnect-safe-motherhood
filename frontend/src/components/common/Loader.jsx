export default function Loader({ fullScreen = false }) {
  return (
    <div
      className={
        fullScreen
          ? "loader-screen"
          : "loader-inline"
      }
    >
      <div className="loader-logo-wrap">
        <img
          src="/careconnect-icon.png"
          alt="CareConnect"
        />

        <span className="pulse p1" />
        <span className="pulse p2" />
      </div>

      {fullScreen && (
        <>
          <h1>
            Care<span>Connect</span>
          </h1>

          <p>Safe Motherhood</p>

          <div className="loader-track">
            <b />
          </div>
        </>
      )}
    </div>
  );
}