import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Layout, Stone } from '../types';

interface ViewerCanvasProps {
  layout: Layout;
  wallWidth: number;
  wallHeight: number;
}

export default function ViewerCanvas({ layout, wallWidth, wallHeight }: ViewerCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const stonesGroupRef = useRef<THREE.Group>();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100000);
    camera.position.set(wallWidth * 0.8, wallHeight * 0.6, wallWidth * 0.8);
    camera.lookAt(wallWidth / 2, wallHeight / 2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(wallWidth, wallHeight * 2, wallWidth);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(wallWidth * 2, wallWidth * 2);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -50;
    ground.receiveShadow = true;
    scene.add(ground);

    // Wall background
    const wallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(wallWidth / 2, wallHeight / 2, -10);
    scene.add(wall);

    // Stones group
    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    stonesGroupRef.current = stonesGroup;

    // Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraDistance = camera.position.distanceTo(new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0));

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position.clone().sub(new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0)));
      
      spherical.theta -= deltaMove.x * 0.01;
      spherical.phi += deltaMove.y * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical).add(new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0));
      camera.lookAt(wallWidth / 2, wallHeight / 2, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const center = new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0);
      const direction = camera.position.clone().sub(center).normalize();
      const distance = camera.position.distanceTo(center);
      
      const newDistance = Math.max(500, Math.min(20000, distance + event.deltaY * 10));
      camera.position.copy(center.clone().add(direction.multiplyScalar(newDistance)));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [wallWidth, wallHeight]);

  // Update stones when layout changes
  useEffect(() => {
    if (!stonesGroupRef.current) return;

    setIsLoading(true);

    // Clear existing stones
    while (stonesGroupRef.current.children.length > 0) {
      const child = stonesGroupRef.current.children[0];
      stonesGroupRef.current.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    // Create stone materials
    const stoneMaterials = [
      new THREE.MeshLambertMaterial({ color: 0x8B7355 }),
      new THREE.MeshLambertMaterial({ color: 0x9C8A6B }),
      new THREE.MeshLambertMaterial({ color: 0x7A6B47 }),
      new THREE.MeshLambertMaterial({ color: 0xA0916F }),
      new THREE.MeshLambertMaterial({ color: 0x6B5B3F })
    ];

    // Add stones in batches to prevent blocking
    const addStonesInBatches = (stones: Stone[], batchSize: number = 50) => {
      let index = 0;

      const addBatch = () => {
        const endIndex = Math.min(index + batchSize, stones.length);
        
        for (let i = index; i < endIndex; i++) {
          const stone = stones[i];
          const geometry = new THREE.BoxGeometry(stone.width, stone.height, stone.depth);
          const material = stoneMaterials[i % stoneMaterials.length];
          const mesh = new THREE.Mesh(geometry, material);
          
          mesh.position.set(
            stone.x + stone.width / 2,
            stone.y + stone.height / 2,
            stone.depth / 2
          );
          
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          stonesGroupRef.current!.add(mesh);
        }

        index = endIndex;

        if (index < stones.length) {
          requestAnimationFrame(addBatch);
        } else {
          setIsLoading(false);
        }
      };

      addBatch();
    };

    addStonesInBatches(layout.stones);
  }, [layout]);

  return (
    <div className="viewer-canvas">
      <div ref={mountRef} className="canvas-container" />
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generating 3D layout...</p>
        </div>
      )}
      <div className="viewer-stats">
        <div className="stat">
          <span className="stat-label">Stones:</span>
          <span className="stat-value">{layout.stoneCount.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Area:</span>
          <span className="stat-value">{(layout.totalArea / 1000000).toFixed(2)} m²</span>
        </div>
      </div>
      <div className="viewer-controls">
        <p>🖱️ Drag to rotate • 🖱️ Scroll to zoom</p>
      </div>
    </div>
  );
}