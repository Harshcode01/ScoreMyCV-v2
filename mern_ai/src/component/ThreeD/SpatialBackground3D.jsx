import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SpatialBackground3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, High-Precision WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 75);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Setup (Key, Rim, Fill)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(20, 30, 40);
    scene.add(keyLight);

    // Violet Rim Light
    const rimLightViolet = new THREE.PointLight(0x8b5cf6, 4.5, 150);
    rimLightViolet.position.set(-35, 25, -10);
    scene.add(rimLightViolet);

    // Emerald Fill Light
    const fillLightEmerald = new THREE.PointLight(0x10b981, 3.2, 120);
    fillLightEmerald.position.set(35, -25, -15);
    scene.add(fillLightEmerald);

    // Interactive Cursor Spotlight
    const cursorLight = new THREE.PointLight(0x6366f1, 3.0, 90);
    cursorLight.position.set(0, 0, 35);
    scene.add(cursorLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    // 3. Tactile 3D Metallic Chrome Torus Knot (Spline Style)
    const torusGeo = new THREE.TorusKnotGeometry(15, 3.8, 128, 32);
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: 0x312e81,
      emissive: 0x1e1b4b,
      metalness: 0.92,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      wireframe: false,
    });
    const torusKnot = new THREE.Mesh(torusGeo, torusMat);
    torusKnot.position.set(38, -12, -25);
    scene.add(torusKnot);

    // Wireframe Outer Cage for Torus
    const wireCageGeo = new THREE.TorusKnotGeometry(15.4, 4.0, 48, 12);
    const wireCageMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireCage = new THREE.Mesh(wireCageGeo, wireCageMat);
    torusKnot.add(wireCage);

    // 4. Secondary Tactile Geometric Crystalline Octahedron
    const octGeo = new THREE.OctahedronGeometry(10, 0);
    const octMat = new THREE.MeshPhysicalMaterial({
      color: 0x064e3b,
      emissive: 0x022c22,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.15,
    });
    const octahedron = new THREE.Mesh(octGeo, octMat);
    octahedron.position.set(-42, 16, -18);
    scene.add(octahedron);

    // Wireframe for Octahedron
    const octWireMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const octWire = new THREE.Mesh(octGeo, octWireMat);
    octahedron.add(octWire);

    // 5. Atmospheric Particle Constellation Starfield
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color("#6366F1"),
      new THREE.Color("#8B5CF6"),
      new THREE.Color("#10B981"),
      new THREE.Color("#E0E7FF"),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 130;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 140;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Tracking with Damped Interpolation
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // 6. Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth camera & light parallax
      targetX += (mouseX * 12 - targetX) * 0.04;
      targetY += (-mouseY * 12 - targetY) * 0.04;

      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      cursorLight.position.x = mouseX * 40;
      cursorLight.position.y = -mouseY * 30;

      // Rotate metallic sculptures
      torusKnot.rotation.x = elapsedTime * 0.12;
      torusKnot.rotation.y = elapsedTime * 0.16;

      octahedron.rotation.x = elapsedTime * 0.15;
      octahedron.rotation.z = elapsedTime * 0.18;

      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      torusGeo.dispose();
      torusMat.dispose();
      wireCageGeo.dispose();
      wireCageMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      octWireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.9,
        overflow: "hidden",
      }}
      aria-hidden="true"
    />
  );
};

export default SpatialBackground3D;
