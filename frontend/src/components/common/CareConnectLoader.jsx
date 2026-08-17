import "./CareConnectLoader.css";

export default function CareConnectLoader() {
  return (
    <div className="cc-loader-wrapper">

      {/* Background shapes */}

      <svg
        className="cc-bg-accent cc-curve-top-left"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M-50 250 C 100 230, 180 120, 190 -40 Z"
          fill="#ffdce0"
          opacity="0.8"
        />
        <path
          d="M-60 180 C 60 160, 120 70, 130 -50 Z"
          fill="#b9dfdc"
          opacity="0.6"
        />
        <path
          d="M120 140 C 120 120, 95 105, 80 125 C 65 105, 40 120, 40 140 C 40 170, 80 195, 80 195 C 80 195, 120 170, 120 140 Z"
          fill="#f8b6be"
          opacity="0.45"
        />
      </svg>

      <svg
        className="cc-bg-accent cc-curve-top-right"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M450 240 C 300 220, 230 110, 210 -40 Z"
          fill="#bde4e1"
          opacity="0.8"
        />
        <path
          d="M450 160 C 340 140, 280 60, 270 -50 Z"
          fill="#fcd7dc"
          opacity="0.65"
        />
      </svg>

      <svg
        className="cc-bg-accent cc-curve-bottom-left"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M-50 160 C 100 180, 170 290, 190 440 Z"
          fill="#bfe5e2"
          opacity="0.75"
        />
        <path
          d="M-60 230 C 50 245, 110 325, 130 450 Z"
          fill="#ffdce0"
          opacity="0.6"
        />
        <path
          d="M130 240 C 130 220, 105 205, 90 225 C 75 205, 50 220, 50 240 C 50 270, 90 295, 90 295 C 90 295, 130 270, 130 240 Z"
          fill="#b3dcd8"
          opacity="0.5"
        />
      </svg>

      <svg
        className="cc-bg-accent cc-curve-bottom-right"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M450 170 C 310 190, 240 300, 220 450 Z"
          fill="#ffdce0"
          opacity="0.8"
        />
        <path
          d="M450 250 C 350 265, 295 340, 280 450 Z"
          fill="#bde4e1"
          opacity="0.6"
        />
        <path
          d="M320 250 C 320 230, 295 215, 280 235 C 265 215, 240 230, 240 250 C 240 280, 280 305, 280 305 C 280 305, 320 280, 320 250 Z"
          fill="#f8b6be"
          opacity="0.45"
        />
      </svg>

      {/* Sparkles */}

      <svg
        className="cc-sparkle cc-sparkle-br"
        viewBox="0 0 24 24"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5z" />
      </svg>

      <svg
        className="cc-sparkle cc-sparkle-tl"
        viewBox="0 0 24 24"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5z" />
      </svg>


      {/* Central logo */}

      <div className="cc-emblem-wrapper">

        <div className="cc-ripple-ring cc-ripple-1" />
        <div className="cc-ripple-ring cc-ripple-2" />

        <div className="cc-token-3d">

            <img
                src="/careconnect-logo.png"
                alt="CareConnect Safe Motherhood"
                className="cc-actual-logo"
            />

        </div>
      </div>


      {/* Branding */}

      <div className="cc-brand-section">

        <div className="cc-brand-title">
          <span className="cc-care-text">
            Care
          </span>

          <span className="cc-connect-text">
            Connect
          </span>
        </div>

        <div className="cc-subtitle-row">

          <div className="cc-sub-bar" />

          <span className="cc-sub-title">
            Safe Motherhood
          </span>

          <div className="cc-sub-bar" />

        </div>
      </div>

    </div>
  );
}