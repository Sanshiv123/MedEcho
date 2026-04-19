import { useEffect, useRef } from "react";

const PURPLE = "#7F77DD";
const PINK = "#D4537E";

const ECG_PATH = `
  M 40,148
  L 158,148
  Q 167,148 170,145
  C 178,135 192,135 200,145
  Q 204,149 210,148
  L 228,148
  L 236,168
  L 248,28
  L 260,178
  L 268,158
  C 278,143 294,138 308,140
  C 318,141 326,145 330,148
  C 332,149 333,149 334,147
  C 338,138 342,110 338,97
  C 335,87 328,80 320,80
  C 308,80 300,88 298,98
  C 296,106 298,120 304,133
  C 312,148 328,160 340,193
  C 352,160 368,148 376,133
  C 382,120 384,106 382,98
  C 380,88 372,80 360,80
  C 352,80 345,87 342,97
  C 338,110 342,138 346,147
  C 347,149 348,149 350,148
  C 356,144 366,142 376,143
  C 390,145 402,150 408,148
  L 420,148
`;

const HEART_PATH = `
  M 330,148
  C 332,149 333,149 334,147
  C 338,138 342,110 338,97
  C 335,87 328,80 320,80
  C 308,80 300,88 298,98
  C 296,106 298,120 304,133
  C 312,148 328,160 340,193
  C 352,160 368,148 376,133
  C 382,120 384,106 382,98
  C 380,88 372,80 360,80
  C 352,80 345,87 342,97
  C 338,110 342,138 346,147
  C 347,149 348,149 350,148
`;

const TAIL_PATH = `M 420,148 L 500,148`;

function useDrawAnimation(ref, dashLength, duration, delay) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.style.strokeDashoffset = "0";
      return;
    }
    el.style.strokeDasharray = `${dashLength}`;
    el.style.strokeDashoffset = `${dashLength}`;
    el.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.42,0,0.58,1) ${delay}s`;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.strokeDashoffset = "0";
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
}

function useFadeAnimation(ref, delay) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.style.opacity = "1";
      return;
    }
    el.style.opacity = "0";
    el.style.transition = `opacity 0.5s ease ${delay}s`;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = "1";
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
}

export default function MedEchoLogo({ width = "100%", height = "auto" }) {
  const ecgRef      = useRef(null);
  const heartRef    = useRef(null);
  const tailRef     = useRef(null);
  const ripple1Ref  = useRef(null);
  const ripple2Ref  = useRef(null);
  const ripple3Ref  = useRef(null);
  const wordmarkRef = useRef(null);

  useDrawAnimation(ecgRef,    2200, 2.4,  0);
  useDrawAnimation(heartRef,   900, 1.0,  1.45);
  useDrawAnimation(tailRef,    200, 0.35, 2.0);
  useFadeAnimation(ripple1Ref, 2.2);
  useFadeAnimation(ripple2Ref, 2.45);
  useFadeAnimation(ripple3Ref, 2.7);
  useFadeAnimation(wordmarkRef, 2.85);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 680 270"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MedEcho logo"
    >
      <title>MedEcho</title>
      <desc>ECG waveform morphing into a heart outline with echo ripples</desc>

      {/* Soft glow */}
      <ellipse cx="340" cy="138" rx="68" ry="60" fill={PINK} opacity="0.08" />

      {/* ECG line — purple */}
      <path
        ref={ecgRef}
        d={ECG_PATH}
        fill="none"
        stroke={PURPLE}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Heart — pink */}
      <path
        ref={heartRef}
        d={HEART_PATH}
        fill="none"
        stroke={PINK}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tail — purple */}
      <path
        ref={tailRef}
        d={TAIL_PATH}
        fill="none"
        stroke={PURPLE}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Echo ripples */}
      <line ref={ripple1Ref} x1="520" y1="133" x2="520" y2="163" stroke={PINK} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <line ref={ripple2Ref} x1="541" y1="138" x2="541" y2="158" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <line ref={ripple3Ref} x1="559" y1="142" x2="559" y2="154" stroke={PINK} strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />

      {/* Wordmark */}
      <g ref={wordmarkRef}>
        <line x1="240" y1="218" x2="440" y2="218" stroke={PURPLE} strokeWidth="0.5" opacity="0.3" />
        <text
          x="255"
          y="255"
          fontFamily="'DM Sans', 'Helvetica Neue', sans-serif"
          fontSize="52"
          fontWeight="500"
          letterSpacing="2"
          fill={PURPLE}
        >
          Med
        </text>
        <text
          x="365"
          y="255"
          fontFamily="'DM Sans', 'Helvetica Neue', sans-serif"
          fontSize="52"
          fontWeight="400"
          letterSpacing="2"
          fill={PINK}
        >
          Echo
        </text>
      </g>
    </svg>
  );
}