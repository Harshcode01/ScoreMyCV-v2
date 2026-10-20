import { useEffect, useRef } from "react";
import * as THREE from "three";

const SplineScene3D = ({ isScanning = false, compact = false }) => {
  const mountRef = useRef(null);
  const isScanningRef = useRef(isScanning);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 360;
    const height = mount.clientHeight || (compact ? 280 : 380);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, compact ? 7.8 : 7.0);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 3);
    dirLight.position.set(-5, 6, 4);
    scene.add(dirLight);

    const ptLight1 = new THREE.PointLight(0xa855f7, 4, 15);
    ptLight1.position.set(5, -4, 3);
    scene.add(ptLight1);

    const ptLightCursor = new THREE.PointLight(0x6366f1, 3, 15);
    ptLightCursor.position.set(0, 0, 4);
    scene.add(ptLightCursor);

    // Center Group
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    // 1. Central Tactile 3D Sculpture: TorusKnot
    const coreGeo = new THREE.TorusKnotGeometry(1.05, 0.3, 128, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    centerGroup.add(coreMesh);

    // 2. Inner Wireframe Octahedron
    const octaGeo = new THREE.OctahedronGeometry(0.7, 0);
    const octaMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const octaMesh = new THREE.Mesh(octaGeo, octaMat);
    centerGroup.add(octaMesh);

    // 3. Three concentric counter-rotating gyroscopic rings
    // Ring 1: tilted at 45deg
    const ring1Geo = new THREE.TorusGeometry(2.05, 0.024, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 4;
    centerGroup.add(ring1);

    // Ring 2: tilted at -45deg
    const ring2Geo = new THREE.TorusGeometry(2.35, 0.024, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x6366f1,
      emissiveIntensity: 0.4,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    centerGroup.add(ring2);

    // Ring 3: tilted at 90deg
    const ring3Geo = new THREE.TorusGeometry(2.65, 0.024, 16, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0xa855f7,
      emissiveIntensity: 0.4,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 2;
    centerGroup.add(ring3);

    // Mouse tracking relative to container
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = Math.max(-1, Math.min(1, x));
      mouse.targetY = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Handle container resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(mount);

    // Dynamic color lerping variables
    const colorNormal1 = new THREE.Color(0xa855f7);
    const colorNormalCursor = new THREE.Color(0x6366f1);
    const colorScan1 = new THREE.Color("#10B981");
    const colorScanCursor = new THREE.Color("#06B6D4");

    let currentSpeedMult = 1.0;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Lerp mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Cursor point light
      ptLightCursor.position.x = mouse.x * 3.5;
      ptLightCursor.position.y = mouse.y * 3.5;

      // Group slight parallax tilt
      centerGroup.rotation.y = mouse.x * 0.35;
      centerGroup.rotation.x = -mouse.y * 0.35;

      // Check scanning state
      const isScanningActive = isScanningRef.current;
      const targetSpeed = isScanningActive ? 4.0 : 1.0;
      currentSpeedMult += (targetSpeed - currentSpeedMult) * 0.06;

      // Smooth color shift
      const targetColor1 = isScanningActive ? colorScan1 : colorNormal1;
      const targetColorCursor = isScanningActive ? colorScanCursor : colorNormalCursor;
      ptLight1.color.lerp(targetColor1, 0.05);
      ptLightCursor.color.lerp(targetColorCursor, 0.05);

      // Sculptural rotations
      const baseSpeed = 0.008 * currentSpeedMult;
      coreMesh.rotation.x += baseSpeed;
      coreMesh.rotation.y += baseSpeed * 1.3;

      octaMesh.rotation.x -= baseSpeed * 1.5;
      octaMesh.rotation.z += baseSpeed * 1.1;

      // Gyroscopic counter-rotations
      ring1.rotation.z += baseSpeed * 0.9;
      ring2.rotation.y -= baseSpeed * 1.1;
      ring3.rotation.x += baseSpeed * 1.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();

      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      coreGeo.dispose();
      coreMat.dispose();

      octaGeo.dispose();
      octaMat.dispose();

      ring1Geo.dispose();
      ring1Mat.dispose();

      ring2Geo.dispose();
      ring2Mat.dispose();

      ring3Geo.dispose();
      ring3Mat.dispose();

      renderer.dispose();
    };
  }, [compact]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: compact ? "clamp(200px, 30vw, 280px)" : "clamp(240px, 40vw, 380px)",
        position: "relative",
        cursor: "grab",
      }}
      data-interactive="true"
    />
  );
};

export default SplineScene3D;
