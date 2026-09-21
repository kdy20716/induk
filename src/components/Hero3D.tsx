'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface SculptItem {
  id: string;
  name: string;
  path: string;
  xPos: number;
  scaleFactor: number;
  yOffset: number;
  customMaterial?: THREE.Material;
}

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const focusedIndexRef = useRef<number>(2); // Center helmet (index 2)

  const sceneStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    wrappers: THREE.Group[];
    keySpot: THREE.SpotLight;
    mouseNormX: number;
    mouseNormY: number;
    cameraTargetX: number;
    cameraTargetZ: number;
    cameraCurrentX: number;
    cameraCurrentZ: number;
    isInspecting: boolean;
    activeSculptRotY: number;
    isIntersecting: boolean;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !sectionRef.current) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    const height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);
    scene.fog = new THREE.FogExp2(0x050507, 0.024);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.0);

    // 3. Ultra-Optimized Renderer (Max pixelRatio 1.25 to prevent 4K GPU lag)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
      alpha: false,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // 4. Lighting - Single key spotlight for ultra-efficient shadow map
    const ambientLight = new THREE.AmbientLight(0x1a1a24, 1.6);
    scene.add(ambientLight);

    const keySpot = new THREE.SpotLight(0xfff6ec, 16.0, 30, Math.PI / 4.2, 0.45, 1.2);
    keySpot.position.set(1.5, 5.2, 3.5);
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.bias = -0.0001;
    scene.add(keySpot);

    const rimLight = new THREE.DirectionalLight(0x9ab8df, 2.6);
    rimLight.position.set(-3.5, 2.5, -2.5);
    scene.add(rimLight);

    // 5. Polished Dark Floor (Floating sculptures, no pedestals)
    const floorGeo = new THREE.PlaneGeometry(60, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07070a,
      roughness: 0.32,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.25;
    floor.receiveShadow = true;
    scene.add(floor);

    // 5 Floating Sculptures
    const sculptConfigs: SculptItem[] = [
      {
        id: 'nefertiti',
        name: 'Classical Bust',
        path: '/models/Nefertiti.glb',
        xPos: -5.6,
        scaleFactor: 1.5,
        yOffset: 0.1,
        customMaterial: new THREE.MeshStandardMaterial({
          color: 0x9b8572,
          roughness: 0.4,
          metalness: 0.2,
        }),
      },
      {
        id: 'primary-ion',
        name: 'Sci-Fi Primary Ion Engine',
        path: '/models/PrimaryIonDrive.glb',
        xPos: -2.8,
        scaleFactor: 1.4,
        yOffset: 0.15,
      },
      {
        id: 'helmet',
        name: 'Proto: Vanguard Cyber Helmet',
        path: '/models/DamagedHelmet.glb',
        xPos: 0,
        scaleFactor: 1.65,
        yOffset: 0.1,
      },
      {
        id: 'xbot',
        name: 'Cyber Bipedal Android (X-Bot)',
        path: '/models/Xbot.glb',
        xPos: 2.8,
        scaleFactor: 1.55,
        yOffset: -0.15,
      },
      {
        id: 'soldier',
        name: 'Tactical Operative Model',
        path: '/models/Soldier.glb',
        xPos: 5.6,
        scaleFactor: 1.5,
        yOffset: -0.15,
      },
    ];

    const wrappers: THREE.Group[] = [];

    sculptConfigs.forEach((config) => {
      const wrapper = new THREE.Group();
      wrapper.position.set(config.xPos, config.yOffset, 0);
      scene.add(wrapper);
      wrappers.push(wrapper);
    });

    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      wrappers,
      keySpot,
      mouseNormX: 0,
      mouseNormY: 0,
      cameraTargetX: 0,
      cameraTargetZ: 5.0,
      cameraCurrentX: 0,
      cameraCurrentZ: 5.0,
      isInspecting: false,
      activeSculptRotY: 0,
      isIntersecting: true,
    };

    // Load models once
    const loader = new GLTFLoader();
    let loadedCount = 0;
    const onModelLoaded = () => {
      loadedCount++;
      if (loadedCount >= sculptConfigs.length) {
        setIsLoading(false);
      }
    };

    sculptConfigs.forEach((config, idx) => {
      loader.load(
        config.path,
        (gltf) => {
          const root = gltf.scene;
          const box = new THREE.Box3().setFromObject(root);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = config.scaleFactor / maxDim;

          root.position.x = -center.x * scale;
          root.position.y = -center.y * scale;
          root.position.z = -center.z * scale;
          root.scale.setScalar(scale);

          root.traverse((c) => {
            if (c instanceof THREE.Mesh) {
              c.castShadow = true;
              c.receiveShadow = false; // Disable self-receive for massive performance boost
              if (config.customMaterial) {
                c.material = config.customMaterial;
              }
            }
          });

          wrappers[idx].add(root);
          onModelLoaded();
        },
        undefined,
        onModelLoaded
      );
    });

    // Mouse Tracking (Smooth Glide without re-rendering)
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (sceneStateRef.current) {
        sceneStateRef.current.mouseNormX = normX;
        sceneStateRef.current.mouseNormY = normY;

        if (!sceneStateRef.current.isInspecting) {
          sceneStateRef.current.cameraTargetX = normX * 5.8;

          const closest = Math.max(0, Math.min(4, Math.round((normX * 5.8 + 5.6) / 2.8)));
          focusedIndexRef.current = closest;
        }
      }

      if (isDragging && sceneStateRef.current) {
        const deltaX = e.clientX - prevX;
        sceneStateRef.current.activeSculptRotY += deltaX * 0.007;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // CLICK TO ZOOM (Wheel zoom is completely decoupled to keep page scroll smooth)
    const onClickCanvas = () => {
      if (!sceneStateRef.current) return;
      const state = sceneStateRef.current;
      const newInspect = !state.isInspecting;
      state.isInspecting = newInspect;
      setIsZoomed(newInspect);

      if (newInspect) {
        state.cameraTargetX = sculptConfigs[focusedIndexRef.current].xPos;
        state.cameraTargetZ = 2.3; // Close-up inspect view
      } else {
        state.cameraTargetZ = 5.0; // Wide gallery view
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClickCanvas);

    // PERFORMANCE OPTIMIZATION: Pause rendering when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (sceneStateRef.current) {
          sceneStateRef.current.isIntersecting = entry.isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(section);

    const onResize = () => {
      if (!canvasRef.current || !canvasRef.current.parentElement) return;
      const w = canvasRef.current.parentElement.clientWidth;
      const h = canvasRef.current.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop with FPS throttling when inactive
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      const state = sceneStateRef.current;
      if (!state || !state.isIntersecting) return; // 0% GPU when scrolled away!

      const delta = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      const { camera, wrappers, keySpot, mouseNormY } = state;

      // Smooth Camera Dolly
      state.cameraCurrentX += (state.cameraTargetX - state.cameraCurrentX) * 0.05;
      state.cameraCurrentZ += (state.cameraTargetZ - state.cameraCurrentZ) * 0.06;

      camera.position.x = state.cameraCurrentX;
      camera.position.z = state.cameraCurrentZ;
      camera.position.y = 0.2 - mouseNormY * 0.18;
      camera.lookAt(state.cameraCurrentX * 0.9, 0.2, 0);

      // Dynamically move the key spotlight over the active sculpture
      keySpot.position.x = state.cameraCurrentX + 1.2;
      keySpot.target.position.set(state.cameraCurrentX, 0, 0);
      keySpot.target.updateMatrixWorld();

      // Idle Rotation
      if (!isDragging) {
        state.activeSculptRotY += delta * 0.14;
      }

      wrappers.forEach((w, i) => {
        w.rotation.y = state.activeSculptRotY * (1 + (i % 2) * 0.15);
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClickCanvas);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []); // Strictly run once on mount!

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#050507] select-none"
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0 cursor-pointer">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Lighting Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-[#050507]/95 z-10" />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#050507]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 rounded-full border border-white/20 border-t-white animate-spin" />
            <span className="text-[10px] font-mono tracking-[0.35em] text-zinc-500 uppercase">
              ENTERING EXHIBITION ROTUNDA
            </span>
          </div>
        </div>
      )}

      {/* Bottom Minimal Tooltip */}
      <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-20 flex justify-center text-center opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-400 uppercase flex items-center gap-2">
          {isZoomed ? (
            <>
              <ZoomOut className="h-3 w-3" />
              CLICK ANYWHERE TO EXIT CLOSE-UP VIEW
            </>
          ) : (
            <>
              <ZoomIn className="h-3 w-3" />
              MOVE MOUSE TO GLIDE &bull; CLICK SCULPTURE TO ZOOM IN
            </>
          )}
        </span>
      </div>
    </section>
  );
}
