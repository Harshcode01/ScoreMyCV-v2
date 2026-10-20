import { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.zIndex = "0";
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    // Procedural 64x64 soft radial-gradient particle texture
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.75)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const particleTexture = createParticleTexture();

    // 1,400 particle nodes distributed in 3D space with vertex colors
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color("#06B6D4"), // Cyan
      new THREE.Color("#6366F1"), // Indigo
      new THREE.Color("#A855F7"), // Violet
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spherical & box random distribution
      positions[i3] = (Math.random() - 0.5) * 55;
      positions[i3 + 1] = (Math.random() - 0.5) * 55;
      positions[i3 + 2] = (Math.random() - 0.5) * 45;

      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.38,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Two large, low-opacity wireframe geometric meshes rotating slowly in deep space
    const icosahedronGeo = new THREE.IcosahedronGeometry(11, 1);
    const icosahedronMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const icosahedron = new THREE.Mesh(icosahedronGeo, icosahedronMat);
    icosahedron.position.set(-2, 0, -5);
    scene.add(icosahedron);

    const torusGeo = new THREE.TorusGeometry(16, 0.06, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 3;
    scene.add(torus);

    // Mouse tracking & smooth lerp parallax
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Window resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Lerp mouse coordinates for smooth camera parallax
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.04;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.04;

      camera.position.x = mouse.currentX * 2.8;
      camera.position.y = mouse.currentY * 2.2;
      camera.lookAt(0, 0, 0);

      // Slow deep-space rotations
      particleSystem.rotation.y += 0.0004;
      particleSystem.rotation.x += 0.00015;

      icosahedron.rotation.x += 0.001;
      icosahedron.rotation.y += 0.0014;

      torus.rotation.z += 0.0008;
      torus.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Comprehensive cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeo.dispose();
      particleMat.dispose();
      if (particleTexture) particleTexture.dispose();

      icosahedronGeo.dispose();
      icosahedronMat.dispose();

      torusGeo.dispose();
      torusMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
};

export default ThreeBackground;
