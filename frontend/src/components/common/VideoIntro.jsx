import "./VideoIntro.css";

export default function VideoIntro({ onFinish }) {
  return (
    <div className="video-intro">
      <video
        className="video-intro-player"
        src="/careconnect-intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        onEnded={onFinish}
        onContextMenu={(event) =>
          event.preventDefault()
        }
      />
    </div>
  );
}