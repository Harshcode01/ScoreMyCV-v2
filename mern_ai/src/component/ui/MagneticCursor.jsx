import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const MagneticCursor = () => {
  const [isFinePointer, setIsFinePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Raw cursor position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for outer trailing ring
  const springConfig = { stiffness: 300, damping: 24 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handleMediaChange = (e) => setIsFinePointer(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    if (!mediaQuery.matches) {
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest('[data-interactive="true"]'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isFinePointer || !isVisible) {
    return null;
  }

  const ringSize = isHovered ? 56 : 36;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Outer Spring Ring */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: isHovered
            ? "1.5px solid rgba(6, 182, 212, 0.9)"
            : "1px solid rgba(6, 182, 212, 0.45)",
          backgroundColor: isHovered
            ? "rgba(6, 182, 212, 0.12)"
            : "rgba(6, 182, 212, 0.03)",
          boxShadow: isHovered
            ? "0 0 20px rgba(6, 182, 212, 0.4)"
            : "0 0 10px rgba(6, 182, 212, 0.15)",
          mixBlendMode: isHovered ? "difference" : "normal",
          pointerEvents: "none",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
        }}
      />

      {/* Inner Immediate Cyan Dot (6px solid) */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "#06B6D4",
          boxShadow: "0 0 8px #06B6D4, 0 0 16px rgba(6, 182, 212, 0.6)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default MagneticCursor;
