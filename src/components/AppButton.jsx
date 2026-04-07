import Button from "@mui/material/Button";
import { useRef } from "react";

export default function AppButton({ sx = [], onClick, children, ...props }) {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 0.7;
    const ripple = document.createElement("span");

    Object.assign(ripple.style, {
      position: "absolute",
      borderRadius: "50%",
      width: `${size}px`,
      height: `${size}px`,
      left: `${e.clientX - rect.left - size / 2}px`,
      top: `${e.clientY - rect.top - size / 2}px`,
      background: "rgba(255,255,255,0.4)",
      transform: "scale(0)",
      animation: "appbtn-ripple 500ms ease-out forwards",
      pointerEvents: "none",
    });

    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
    onClick?.(e);
  };

  return (
    <>
      <style>{`
        @keyframes appbtn-ripple {
          from { transform: scale(0); opacity: 0.4; }
          to   { transform: scale(4); opacity: 0; }
        }
        @keyframes appbtn-shine {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        .app-btn-root::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(
            110deg,
            transparent 22%,
            rgba(255,255,255,0.2) 36%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0.2) 64%,
            transparent 78%
          );
          transform: translateX(-100%);
          opacity: 0;
          transition: opacity 120ms ease;
          pointer-events: none;
        }
        .app-btn-root:hover::before {
          opacity: 1;
          animation: appbtn-shine 0.7s ease forwards;
        }
      `}</style>

      <Button
        ref={btnRef}
        disableElevation
        disableRipple
        className="app-btn-root"
        onClick={handleClick}
        {...props}
        sx={[
          {
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            transition:
              "transform 180ms cubic-bezier(.34,1.56,.64,1), box-shadow 180ms ease",
            "&:hover": {
              transform: "translateY(-2px) scale(1.025)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            },
            "&:active": {
              transform: "translateY(0) scale(0.97)",
              transition: "transform 80ms ease",
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Button>
    </>
  );
}