import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const SpatialCard = ({
  children,
  className = "",
  style = {},
  tiltIntensity = 8,
  glare = true,
  crosshairs = true,
  telemetry = "",
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coords relative to card
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    setSpotlightPos({
      x: mouseX,
      y: mouseY,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
        perspective: 1200,
        position: "relative",
        boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
        ...style,
      }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`spatial-bento-card ${className}`}
      {...props}
    >
      {/* 1. Cursor-Tracking Spotlight Glow */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 1,
            background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(99, 102, 241, 0.14), transparent 80%)`,
          }}
        />
      )}

      {/* 2. Swiss Editorial Corner Crosshairs */}
      {crosshairs && (
        <>
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 8,
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "rgba(255, 255, 255, 0.25)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 3,
            }}
          >
            +
          </span>
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 8,
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "rgba(255, 255, 255, 0.25)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 3,
            }}
          >
            +
          </span>
          <span
            style={{
              position: "absolute",
              bottom: 6,
              left: 8,
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "rgba(255, 255, 255, 0.25)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 3,
            }}
          >
            +
          </span>
          <span
            style={{
              position: "absolute",
              bottom: 6,
              right: 8,
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "rgba(255, 255, 255, 0.25)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 3,
            }}
          >
            +
          </span>
        </>
      )}

      {/* 3. Numbered Monospace Telemetry Header (if provided) */}
      {telemetry && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px 12px 8px",
            borderBottom: "1px solid var(--border-glass)",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#818CF8",
              textTransform: "uppercase",
            }}
          >
            {telemetry}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}
          >
            SYS_OK // 2026
          </span>
        </div>
      )}

      {/* 4. Main Card Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default SpatialCard;
