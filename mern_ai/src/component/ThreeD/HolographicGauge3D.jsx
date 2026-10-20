import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const HolographicGauge3D = ({ score = 85, size = 150 }) => {
  const mountRef = useRef(null);

  const getTierColor = (s) => {
    if (s >= 75) return "#10B981"; // Cyber Emerald
    if (s >= 50) return "#F59E0B"; // Amber
    return "#F43F5E"; // Rose
  };

  const primaryColorHex = getTierColor(score);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Studio Lights for Gauge
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(5, 10, 10);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(new THREE.Color(primaryColorHex), 4, 30);
    rimLight.position.set(-8, 8, -5);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // 1. Tactile 3D Metallic Ring (MeshPhysicalMaterial)
    const torusGeo = new THREE.TorusGeometry(6.4, 0.4, 24, 64);
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(primaryColorHex),
      emissive: new THREE.Color(primaryColorHex).multiplyScalar(0.25),
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const mainRing = new THREE.Mesh(torusGeo, torusMat);
    group.add(mainRing);

    // 2. Telemetry Wireframe Orbit Cage
    const cageGeo = new THREE.TorusGeometry(6.6, 0.55, 12, 32);
    const cageMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(primaryColorHex),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const cageRing = new THREE.Mesh(cageGeo, cageMat);
    group.add(cageRing);

    // 3. Inner Gyroscope Ring
    const innerRingGeo = new THREE.TorusGeometry(5.1, 0.18, 12, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(primaryColorHex),
      wireframe: false,
      transparent: true,
      opacity: 0.5,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 3;
    group.add(innerRing);

    // 4. Shimmering Orbiting Data Satellites
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 7.4 + (Math.random() - 0.5) * 1.2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(primaryColorHex),
      size: 0.5,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      group.rotation.z = elapsedTime * 0.35;
      group.rotation.x = Math.sin(elapsedTime * 0.7) * 0.2;
      group.rotation.y = Math.cos(elapsedTime * 0.5) * 0.2;

      innerRing.rotation.y = -elapsedTime * 0.6;
      particles.rotation.z = -elapsedTime * 0.45;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      torusGeo.dispose();
      torusMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [score, size, primaryColorHex]);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: size > 110 ? "34px" : "22px",
            fontWeight: 800,
            color: primaryColorHex,
            textShadow: `0 0 18px ${primaryColorHex}aa`,
            letterSpacing: "-0.03em",
          }}
        >
          {score}%
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
          }}
        >
          ATS_SCORE // 4.2
        </span>
      </div>
    </div>
  );
};

export default HolographicGauge3D;
