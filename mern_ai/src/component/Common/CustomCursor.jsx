import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Buttery-smooth spring physics for follower ring
  const ringX = useSpring(mouseX, { stiffness: 450, damping: 30 });
  const ringY = useSpring(mouseY, { stiffness: 450, damping: 30 });

  useEffect(() => {
    // Disable custom cursor on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleElementHover = (e) => {
      const target = e.target;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest('[role="button"]') ||
        target.closest(".interactive")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousemove", handleElementHover, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleElementHover);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* 1. Precision Central Dot */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovered ? 8 : 5,
          height: isHovered ? 8 : 5,
          borderRadius: "50%",
          backgroundColor: isHovered ? "#818CF8" : "#FFFFFF",
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: "difference",
          boxShadow: isHovered ? "0 0 10px #818CF8" : "none",
          transition: "width 0.15s ease, height 0.15s ease, background-color 0.15s ease",
        }}
      />

      {/* 2. Magnetic Follower Ring */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovered ? 48 : 26,
          height: isHovered ? 48 : 26,
          borderRadius: "50%",
          border: isHovered
            ? "1.5px solid rgba(129, 140, 248, 0.75)"
            : "1px solid rgba(255, 255, 255, 0.35)",
          backgroundColor: isHovered ? "rgba(99, 102, 241, 0.08)" : "transparent",
          backdropFilter: isHovered ? "blur(2px)" : "none",
          pointerEvents: "none",
          zIndex: 99998,
          transition: "width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), border 0.2s ease, background-color 0.2s ease",
        }}
      />
    </>
  );
};

export default CustomCursor;
