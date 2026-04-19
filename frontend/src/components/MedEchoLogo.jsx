// frontend/src/components/MedEchoLogo.jsx
// Animated SVG logo for MedEcho.
//
// The animation tells the product story visually:
// 1. An ECG waveform draws itself across the screen (purple)
// 2. The ECG morphs into a heart outline at the peak (pink)
// 3. A tail continues from the heart back to a flat line (purple)
// 4. Echo ripples pulse outward from the end of the line
// 5. The "MedEcho" wordmark fades in below
//
// Animation is driven by SVG stroke-dashoffset and CSS transitions.
// Respects prefers-reduced-motion — draws instantly if motion is reduced.
//
// Props:
//   width  — SVG width (default "100%")
//   height — SVG height (default "auto")

import { useEffect, useRef } from "react";

// Brand colors
const PURPLE = "#7F77DD";  // ECG line + wordmark "Med"
const PINK = "#D4537E";    // Heart outline + wordmark "Echo" + ripples

// ---------------------------------------------------------------------------
// SVG path definitions
// ---------------------------------------------------------------------------

// Full ECG waveform — flat baseline with a QRS complex peak
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

// Heart shape — extracted from the ECG path at the peak
// Drawn on top of the ECG in pink to highlight the heart region
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

// Short tail — continues the ECG line after the heart back to baseline
const TAIL_PATH = `M 420,148 L 500,148`;


// ---------------------------------------------------------------------------
// Animation hooks
// ---------------------------------------------------------------------------

/**
 * Animates a path element drawing itself using stroke-dashoffset.
 *
 * Sets strokeDasharray and strokeDashoffset to dashLength (fully hidden),
 * then transitions dashOffset to 0 (fully drawn) after the specified delay.
 *
 * @param ref         React ref to the SVG path element
 * @param dashLength  Total path length in SVG units
 * @param duration    Animation duration in seconds
 * @param delay       Animation start delay in seconds
 */
function useDrawAnimation(ref, dashLength, duration, delay) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.style.strokeDashoffset = "0";
      return;
    }

    // Start hidden
    el.style.strokeDasharray = `${dashLength}`;
    el.style.strokeDashoffset = `${dashLength}`;
    el.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.42,0,0.58,1) ${delay}s`;

    // Trigger draw on next frame
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.strokeDashoffset = "0";
      });
    });

    return () => cancelAnimationFrame(frame);
  }, []);
}

/**
 * Animates an element fading in from opacity 0 to 1.
 *
 * @param ref    React ref to the SVG element
 * @param delay  Fade start delay in seconds
 */
function useFadeAnimation(ref, delay) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.style.opacity = "1";
      return;
    }

    // Start invisible
    el.style.opacity = "0";
    el.style.transition = `opacity 0.5s ease ${delay}s`;

    // Trigger fade on next frame
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = "1";
      });
    });

    return () => cancelAnimationFrame(frame);
  }, []);
}


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MedEchoLogo({ width = "100%", height = "auto" }) {
  // Refs for each animated element
  const ecgRef      = useRef(null);   // Purple ECG waveform
  const heartRef    = useRef(null);   // Pink heart overlay
  const tailRef     = useRef(null);   // Purple tail line
  const ripple1Ref  = useRef(null);   // Echo ripple 1 (largest)
  const ripple2Ref  = useRef(null);   // Echo ripple 2 (medium)
  const ripple3Ref  = useRef(null);   // Echo ripple 3 (smallest)
  const wordmarkRef = useRef(null);   // "MedEcho" text

  // Animation sequence — each element draws/fades after the previous
  useDrawAnimation(ecgRef,    2200, 2.4,  0);      // ECG draws over 2.4s
  useDrawAnimation(heartRef,   900, 1.0,  1.45);   // Heart draws at peak
  useDrawAnimation(tailRef,    200, 0.35, 2.0);    // Tail continues after heart
  useFadeAnimation(ripple1Ref, 2.2);               // Ripples pulse in sequence
  useFadeAnimation(ripple2Ref, 2.45);
  useFadeAnimation(ripple3Ref, 2.7);
  useFadeAnimation(wordmarkRef, 2.85);             // Wordmark fades in last

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

      {/* Soft pink glow behind the heart region */}
      <ellipse cx="340" cy="138" rx="68" ry="60" fill={PINK} opacity="0.08" />

      {/* ECG waveform — purple baseline with QRS complex */}
      <path
        ref={ecgRef}
        d={ECG_PATH}
        fill="none"
        stroke={PURPLE}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Heart outline — pink, drawn over the ECG peak */}
      <path
        ref={heartRef}
        d={HEART_PATH}
        fill="none"
        stroke={PINK}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tail — purple baseline continuing after the heart */}
      <path
        ref={tailRef}
        d={TAIL_PATH}
        fill="none"
        stroke={PURPLE}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Echo ripples — three vertical lines diminishing in size and opacity */}
      <line ref={ripple1Ref} x1="520" y1="133" x2="520" y2="163" stroke={PINK} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <line ref={ripple2Ref} x1="541" y1="138" x2="541" y2="158" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <line ref={ripple3Ref} x1="559" y1="142" x2="559" y2="154" stroke={PINK} strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />

      {/* Wordmark — "Med" in purple, "Echo" in pink */}
      <g ref={wordmarkRef}>
        {/* Thin divider line above the wordmark */}
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