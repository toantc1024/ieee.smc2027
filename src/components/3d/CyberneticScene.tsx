"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCw, Box } from "lucide-react";

type GeometryMode = "lattice" | "feedback" | "synapse";

export function CyberneticScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<GeometryMode>("lattice");
  const [isRotating, setIsRotating] = useState(true);
  const [wireframeOnly, setWireframeOnly] = useState(false);

  // Store internal refs to Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentMeshGroup = useRef<THREE.Group | null>(null);
  const requestRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    // 3. Renderer with antialiasing and transparent background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00629b, 4, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0284c7, 3, 50);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    // 5. Build Group
    const group = new THREE.Group();
    scene.add(group);
    currentMeshGroup.current = group;

    // Function to populate geometry based on mode
    const buildGeometry = (mode: GeometryMode) => {
      // Clear previous children
      while (group.children.length > 0) {
        const obj = group.children[0];
        group.remove(obj);
      }

      const ieeeBlue = 0x00629b;
      const skyBlue = 0x0284c7;
      const darkBlue = 0x003b5c;

      if (mode === "lattice") {
        // Core Icosahedron (Systems Science & Cybernetics)
        const icoGeo = new THREE.IcosahedronGeometry(1.6, 1);
        const icoMat = new THREE.MeshPhongMaterial({
          color: ieeeBlue,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
        });
        const icoMesh = new THREE.Mesh(icoGeo, icoMat);
        group.add(icoMesh);

        // Inner solid core
        const innerGeo = new THREE.OctahedronGeometry(0.9, 0);
        const innerMat = new THREE.MeshStandardMaterial({
          color: darkBlue,
          roughness: 0.2,
          metalness: 0.8,
          wireframe: wireframeOnly,
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        group.add(innerMesh);

        // Nodes on vertices
        const pos = icoGeo.attributes.position;
        const sphereGeo = new THREE.SphereGeometry(0.045, 12, 12);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        for (let i = 0; i < pos.count; i += 3) {
          const node = new THREE.Mesh(sphereGeo, sphereMat);
          node.position.set(pos.getX(i), pos.getY(i), pos.getZ(i));
          group.add(node);
        }
      } else if (mode === "feedback") {
        // Torus Cybernetic Control Loop
        const torusGeo = new THREE.TorusGeometry(1.4, 0.38, 16, 64);
        const torusMat = new THREE.MeshStandardMaterial({
          color: ieeeBlue,
          wireframe: true,
          transparent: true,
          opacity: 0.8,
          roughness: 0.3,
        });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        group.add(torus);

        // Gyroscopic Outer Rings
        const ring1Geo = new THREE.RingGeometry(1.9, 1.95, 48);
        const ring1Mat = new THREE.MeshBasicMaterial({ color: skyBlue, side: THREE.DoubleSide });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.rotation.x = Math.PI / 3;
        group.add(ring1);

        const ring2 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring2.rotation.y = Math.PI / 2.5;
        group.add(ring2);

        // Center orb
        const centerOrb = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 24, 24),
          new THREE.MeshStandardMaterial({ color: 0x00629b, roughness: 0.1, metalness: 0.9 })
        );
        group.add(centerOrb);
      } else if (mode === "synapse") {
        // Neural Synapse Point Cloud with Connecting Vectors
        const particleCount = 70;
        const positions = new Float32Array(particleCount * 3);
        const nodeSpheres: THREE.Vector3[] = [];

        for (let i = 0; i < particleCount; i++) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = Math.cbrt(Math.random()) * 1.6 + 0.3;
          const sinPhi = Math.sin(phi);
          const x = r * sinPhi * Math.cos(theta);
          const y = r * sinPhi * Math.sin(theta);
          const z = r * Math.cos(phi);

          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
          nodeSpheres.push(new THREE.Vector3(x, y, z));
        }

        // Draw connecting lines between close points
        const linePositions: number[] = [];
        for (let i = 0; i < particleCount; i++) {
          for (let j = i + 1; j < particleCount; j++) {
            const dist = nodeSpheres[i].distanceTo(nodeSpheres[j]);
            if (dist < 0.95) {
              linePositions.push(nodeSpheres[i].x, nodeSpheres[i].y, nodeSpheres[i].z);
              linePositions.push(nodeSpheres[j].x, nodeSpheres[j].y, nodeSpheres[j].z);
            }
          }
        }

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: ieeeBlue,
          transparent: true,
          opacity: 0.45,
        });
        const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
        group.add(linesMesh);

        // Nodes
        const ptGeo = new THREE.BufferGeometry();
        ptGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const ptMat = new THREE.PointsMaterial({
          color: 0x0ea5e9,
          size: 0.08,
          transparent: true,
          opacity: 0.9,
        });
        const points = new THREE.Points(ptGeo, ptMat);
        group.add(points);
      }
    };

    buildGeometry(activeMode);

    // Mouse movement handler for 3D parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseRef.current.targetX = (clientX / rect.width - 0.5) * 2;
      mouseRef.current.targetY = (clientY / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.01;

      // Smooth mouse interpolation (inertia)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (group) {
        if (isRotating) {
          group.rotation.y += 0.007;
          group.rotation.x += 0.003;
        }

        // Apply subtle mouse parallax tilt
        group.rotation.y += mouseRef.current.x * 0.02;
        group.rotation.x += mouseRef.current.y * 0.02;

        // Subtle floating bounce
        group.position.y = Math.sin(time) * 0.08;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeMode, isRotating, wireframeOnly]);

  return (
    <div className="relative w-full h-[400px] lg:h-[460px] bg-gradient-to-b from-blue-950/5 to-transparent border border-slate-200 rounded-md overflow-hidden flex flex-col justify-between p-4 group">
      
      {/* Top 3D Control Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#115eff]" />
          <span className="text-xs font-semibold text-[#115eff]">
            3D Cybernetic Visualizer
          </span>
        </div>

        {/* 3D Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs p-0.5 border border-slate-200 rounded-lg">
          <button
            onClick={() => setActiveMode("lattice")}
            title="Systems Lattice Mode"
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeMode === "lattice"
                ? "bg-[#115eff] text-white shadow-2xs"
                : "text-slate-600 hover:text-[#115eff]"
            }`}
          >
            Lattice
          </button>
          <button
            onClick={() => setActiveMode("feedback")}
            title="Cybernetic Feedback Loop Mode"
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeMode === "feedback"
                ? "bg-[#115eff] text-white shadow-2xs"
                : "text-slate-600 hover:text-[#115eff]"
            }`}
          >
            Feedback
          </button>
          <button
            onClick={() => setActiveMode("synapse")}
            title="Neural Synapse Mode"
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeMode === "synapse"
                ? "bg-[#115eff] text-white shadow-2xs"
                : "text-slate-600 hover:text-[#115eff]"
            }`}
          >
            Synapse
          </button>
        </div>
      </div>

      {/* WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      />

      {/* Bottom Controls */}
      <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              isRotating
                ? "bg-blue-50 border-blue-200 text-[#115eff]"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <RotateCw className={`w-3 h-3 ${isRotating ? "animate-spin" : ""}`} />
            <span>{isRotating ? "Spinning" : "Paused"}</span>
          </button>

          <button
            onClick={() => setWireframeOnly(!wireframeOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              wireframeOnly
                ? "bg-blue-50 border-blue-200 text-[#115eff]"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Box className="w-3 h-3" />
            <span>Wireframe</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[#115eff] text-xs font-medium">
          <span>Interactive 3D • Drag to rotate</span>
        </div>
      </div>

    </div>
  );
}

