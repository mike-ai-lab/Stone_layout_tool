import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls

// Assuming these types are defined elsewhere or will be provided
interface Stone {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
}

interface Layout {
  stones: Stone[];
  stoneCount: number;
  totalArea: number;
}

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
  const controlsRef = useRef<OrbitControls>(); // Ref for OrbitControls
  const stonesGroupRef = useRef<THREE.Group>();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Three.js scene, camera, renderer, and controls
  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); // Lighter background for a modern feel
    sceneRef.current = scene;

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100000);
    // Position camera to view the wall from a good angle
    camera.position.set(wallWidth * 0.8, wallHeight * 0.6, wallWidth * 0.8);
    camera.lookAt(wallWidth / 2, wallHeight / 2, 0); // Look at the center of the wall
    cameraRef.current = camera;

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // --- Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7); // Slightly brighter ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Brighter directional light
    directionalLight.position.set(wallWidth * 1.5, wallHeight * 2, wallWidth * 1.5); // Adjusted position for better shadows
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 5000;
    directionalLight.shadow.camera.left = -wallWidth * 2;
    directionalLight.shadow.camera.right = wallWidth * 2;
    directionalLight.shadow.camera.top = wallHeight * 2;
    directionalLight.shadow.camera.bottom = -wallHeight * 2;
    scene.add(directionalLight);

    // --- Ground Plane ---
    const groundGeometry = new THREE.PlaneGeometry(wallWidth * 3, wallWidth * 3); // Larger ground plane
    // Modern, light grey material for the ground
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xd0d0d0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -wallHeight * 0.1; // Slightly below the wall's base for better integration
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Wall Background ---
    const wallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xe8e8e8 }); // Lighter wall color
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(wallWidth / 2, wallHeight / 2, -10);
    scene.add(wall);

    // --- Stones Group ---
    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    stonesGroupRef.current = stonesGroup;

    // --- OrbitControls for natural navigation ---
    // This replaces all custom mouse/wheel event handlers
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth camera movement
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Prevents panning beyond a certain point
    controls.minDistance = 100; // Minimum zoom distance
    controls.maxDistance = 25000; // Maximum zoom distance
    controls.target.set(wallWidth / 2, wallHeight / 2, 0); // Set target to the center of the wall
    controlsRef.current = controls;

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Required for damping and other updates
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle Resize ---
    const handleResize = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose(); // Dispose controls on unmount
    };
  }, [wallWidth, wallHeight]); // Re-run effect if wall dimensions change

  // Update stones when layout changes
  useEffect(() => {
    if (!stonesGroupRef.current) return;

    setIsLoading(true);

    // Clear existing stones from the group
    while (stonesGroupRef.current.children.length > 0) {
      const child = stonesGroupRef.current.children[0];
      stonesGroupRef.current.remove(child);
      // Dispose of geometry and material to prevent memory leaks
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    // Define a new, modern color palette for the stones
    const stoneMaterials = [
      new THREE.MeshLambertMaterial({ color: 0x9e9e9e }), // Medium Grey
      new THREE.MeshLambertMaterial({ color: 0xbdbdbd }), // Light Grey
      new THREE.MeshLambertMaterial({ color: 0x757575 }), // Dark Grey
      new THREE.MeshLambertMaterial({ color: 0xeeeeee }), // Off-White
      new THREE.MeshLambertMaterial({ color: 0x616161 })  // Even Darker Grey
    ];

    // Function to add stones in batches to prevent UI freezing for large layouts
    const addStonesInBatches = (stones: Stone[], batchSize: number = 50) => {
      let index = 0;

      const addBatch = () => {
        const endIndex = Math.min(index + batchSize, stones.length);
        
        for (let i = index; i < endIndex; i++) {
          const stone = stones[i];
          const geometry = new THREE.BoxGeometry(stone.width, stone.height, stone.depth);
          const material = stoneMaterials[i % stoneMaterials.length]; // Cycle through defined materials
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position the stone correctly (origin is center of geometry)
          mesh.position.set(
            stone.x + stone.width / 2,
            stone.y + stone.height / 2,
            stone.depth / 2
          );
          
          mesh.castShadow = true;
          mesh.receiveShadow = true; // Stones can also receive shadows from other objects
          
          stonesGroupRef.current!.add(mesh);
        }

        index = endIndex;

        // If there are more stones, request another animation frame to add the next batch
        if (index < stones.length) {
          requestAnimationFrame(addBatch);
        } else {
          setIsLoading(false); // All stones added, hide loading overlay
        }
      };

      addBatch(); // Start the batch processing
    };

    addStonesInBatches(layout.stones);
  }, [layout]); // Re-run effect if the layout data changes

  return (
    <div className="viewer-canvas" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={mountRef} className="canvas-container" style={{ width: '100%', height: '100%' }} />
      {isLoading && (
        <div className="loading-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          borderRadius: '8px'
        }}>
          <div className="loading-spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '10px', color: '#333' }}>Generating 3D layout...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      <div className="viewer-stats" style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '20px',
        fontSize: '14px',
        color: '#333'
      }}>
        <div className="stat">
          <span className="stat-label" style={{ fontWeight: 'bold', marginRight: '5px' }}>Stones:</span>
          <span className="stat-value">{layout.stoneCount.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label" style={{ fontWeight: 'bold', marginRight: '5px' }}>Area:</span>
          <span className="stat-value">{(layout.totalArea / 1000000).toFixed(2)} m²</span>
        </div>
      </div>
      <div className="viewer-controls" style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px 15px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '14px',
        color: '#333'
      }}>
        <p>🖱️ Drag to rotate/pan • 🖱️ Scroll to zoom</p>
      </div>
    </div>
  );
}
