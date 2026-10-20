import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ChronographScoreDial = ({ score = 0, size = 240 }) => {
  const numericScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

  // Semantic status tiers
  const tierConfig = (() => {
    if (numericScore >= 75) {
      return {
        color: "#10B981", // Emerald
        badge: "ELITE ATS MATCH",
        bg: "rgba(16, 185, 129, 0.12)",
        glow: "rgba(16, 185, 129, 0.45)",
      };
    }
    if (numericScore >= 50) {
      return {
        color: "#F59E0B", // Amber
        badge: "COMPETITIVE MATCH",
        bg: "rgba(245, 158, 11, 0.12)",
        glow: "rgba(245, 158, 11, 0.45)",
      };
    }
    return {
      color: "#F43F5E", // Rose
      badge: "OPTIMIZATION REQUIRED",
      bg: "rgba(244, 63, 94, 0.12)",
      glow: "rgba(244, 63, 94, 0.45)",
    };
  })();

  // Animated Counter for JetBrains Mono Integer Display
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1400; // ms
    let frameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out expo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayCount(Math.round(easeOut * numericScore));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [numericScore]);

  // SVG Geometry constants
  const cx = 120;
  const cy = 120;
  const progressRadius = 82;
  const circumference = 2 * Math.PI * progressRadius; // ~515.22
  const targetOffset = circumference - (numericScore / 100) * circumference;

  // 60 radial ticks around circumference
  const ticks = Array.from({ length: 60 }, (_, i) => {
    // Start at top (-90 deg)
    const angleDeg = (i * 360) / 60 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const isMajor = i % 5 === 0;

    const rOuter = 104;
    const rInner = isMajor ? 92 : 97;

    const x1 = cx + rOuter * Math.cos(angleRad);
    const y1 = cy + rOuter * Math.sin(angleRad);
    const x2 = cx + rInner * Math.cos(angleRad);
    const y2 = cy + rInner * Math.sin(angleRad);

    const isPassed = (i / 60) * 100 <= numericScore;

    return {
      x1,
      y1,
      x2,
      y2,
      isMajor,
      isPassed,
    };
  });

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 800,
      }}
    >
      {/* 240x240 Precision Chronograph SVG */}
      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
        }}
      >
        <defs>
          <filter id="scoreGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Rotating Dashed Orbital Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={112}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
          strokeDasharray="4 8"
          style={{
            transformOrigin: "center",
            animation: "spinSlow 35s linear infinite",
          }}
        />

        {/* Inner subtle guide track */}
        <circle
          cx={cx}
          cy={cy}
          r={progressRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="6"
        />

        {/* 60 Radial Ticks */}
        {ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={
              t.isPassed
                ? tierConfig.color
                : t.isMajor
                ? "rgba(255, 255, 255, 0.35)"
                : "rgba(255, 255, 255, 0.12)"
            }
            strokeWidth={t.isMajor ? 2 : 1}
            strokeLinecap="round"
            opacity={t.isPassed ? 1 : t.isMajor ? 0.7 : 0.4}
          />
        ))}

        {/* Glowing Progress Arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={progressRadius}
          fill="none"
          stroke={tierConfig.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#scoreGlowFilter)"
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
          }}
        />
      </svg>

      {/* Center 3D Display Container (transform: translateZ(40px)) */}
      <div
        className="depth-z-2"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateZ(40px)",
          textAlign: "center",
        }}
      >
        {/* Animated Integer Counter in JetBrains Mono */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "3rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "#F8FAFC",
            letterSpacing: "-0.04em",
            textShadow: `0 0 24px ${tierConfig.glow}`,
          }}
        >
          {displayCount}
          <span
            style={{
              fontSize: "1.4rem",
              fontWeight: 500,
              color: tierConfig.color,
              marginLeft: "2px",
            }}
          >
            %
          </span>
        </div>

        {/* Semantic Tier Pill Badge */}
        <div
          style={{
            marginTop: "10px",
            padding: "4px 10px",
            borderRadius: "9999px",
            fontFamily: "var(--font-mono)",
            fontSize: "9.5px",
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: tierConfig.color,
            backgroundColor: tierConfig.bg,
            border: `1px solid ${tierConfig.color}`,
            boxShadow: `0 0 12px ${tierConfig.glow}`,
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: tierConfig.color,
              boxShadow: `0 0 6px ${tierConfig.color}`,
            }}
          />
          {tierConfig.badge}
        </div>
      </div>
    </div>
  );
};

export default ChronographScoreDial;
