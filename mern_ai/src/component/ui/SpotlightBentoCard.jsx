import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SpotlightBentoCard = ({
  children,
  className = "",
  style = {},
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw tilt values
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);

  // Smooth springs for 3D tilt
  const springConfig = { stiffness: 260, damping: 20 };
  const rotateX = useSpring(rawRotateX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });
    setIsHovered(true);

    // Calculate -6deg to +6deg tilt
    const nx = (x / rect.width) * 2 - 1;
    const ny = (y / rect.height) * 2 - 1;

    rawRotateX.set(-ny * 6);
    rawRotateY.set(nx * 6);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  return (
    <div
      style={{
        perspective: 1200,
        ...style,
      }}
      className={`spotlight-bento-container ${className}`}
      {...props}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "var(--bg-surface)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "20px",
          border: "1px solid var(--border-hairline)",
          boxShadow: isHovered
            ? "0 20px 45px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.12)"
            : "0 12px 35px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          transition: "box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease",
          "--mouse-x": `${mousePos.x}px`,
          "--mouse-y": `${mousePos.y}px`,
        }}
      >
        {/* Radial Border & Surface Spotlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            background: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.45), rgba(6, 182, 212, 0.2), transparent 60%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
            borderRadius: "inherit",
            zIndex: 1,
          }}
          aria-hidden="true"
        />

        {/* Ambient interior spotlight flare */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: isHovered ? 0.08 : 0,
            transition: "opacity 0.4s ease",
            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(6, 182, 212, 0.6), transparent 70%)`,
            zIndex: 1,
          }}
          aria-hidden="true"
        />

        {/* Decorative Swiss '+' Crosshair Markers at 4 corners */}
        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            lineHeight: 1,
            color: "rgba(255, 255, 255, 0.22)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 3,
          }}
          aria-hidden="true"
        >
          +
        </span>
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            lineHeight: 1,
            color: "rgba(255, 255, 255, 0.22)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 3,
          }}
          aria-hidden="true"
        >
          +
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            lineHeight: 1,
            color: "rgba(255, 255, 255, 0.22)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 3,
          }}
          aria-hidden="true"
        >
          +
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            lineHeight: 1,
            color: "rgba(255, 255, 255, 0.22)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 3,
          }}
          aria-hidden="true"
        >
          +
        </span>

        {/* Card Content with 3D Preservation */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default SpotlightBentoCard;
