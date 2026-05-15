import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import { TextRing } from './TextRing';
import * as THREE from 'three';

interface SceneProps {
  resetTrigger?: number;
  radius: number;
  fontSize: number;
  fontUrl?: string;
}

// Inner component to handle logic that requires useThree context
const SceneContent: React.FC<{ resetTrigger: number; radius: number; fontSize: number; fontUrl?: string }> = ({ resetTrigger, radius, fontSize, fontUrl }) => {
  const controlsRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // State for animation and interaction
  const [isResetting, setIsResetting] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Target vectors for reset
  // Use useMemo to avoid recreating vectors on every render
  const targets = React.useMemo(() => ({
    pos: new THREE.Vector3(0, 0, 9),
    up: new THREE.Vector3(0, 1, 0),
    lookAt: new THREE.Vector3(0, 0, 0)
  }), []);
  
  // Listen for interaction start/end to pause auto-rotation
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      const onStart = () => setIsInteracting(true);
      const onEnd = () => setIsInteracting(false);

      controls.addEventListener('start', onStart);
      controls.addEventListener('end', onEnd);

      return () => {
        // Check if controls still exist before removing listeners
        if (controls) {
          controls.removeEventListener('start', onStart);
          controls.removeEventListener('end', onEnd);
        }
      };
    }
  }, []);
  
  useEffect(() => {
    if (resetTrigger > 0) {
      setIsResetting(true);
      if (controlsRef.current) {
        controlsRef.current.enabled = false; // Disable controls during animation
      }
    }
  }, [resetTrigger]);

  useFrame((state, delta) => {
    // Auto Rotation Logic (when idle)
    // Rotates the group COUNTER-CLOCKWISE (positive Z)
    if (!isInteracting && !isResetting && groupRef.current) {
      groupRef.current.rotation.z += delta * 0.1; 
    }

    if (isResetting) {
      // Smooth reset logic
      const speed = 4 * delta;

      // 1. Spherical interpolation for Position
      const currentDist = camera.position.length();
      const targetDist = 9;
      
      // Interpolate distance
      const newDist = THREE.MathUtils.lerp(currentDist, targetDist, speed);
      
      // Interpolate direction
      const currentDir = camera.position.clone().normalize();
      const targetDir = new THREE.Vector3(0, 0, 1); 
      
      currentDir.lerp(targetDir, speed).normalize();
      
      // Apply new position
      camera.position.copy(currentDir.multiplyScalar(newDist));

      // 2. Interpolate Up vector
      camera.up.lerp(targets.up, speed);
      
      // 3. Ensure looking at center
      camera.lookAt(targets.lookAt);

      // 4. Check if close enough to stop
      const angleDiff = camera.position.angleTo(targets.pos);
      const distDiff = Math.abs(currentDist - targetDist);
      const upDiff = camera.up.distanceTo(targets.up);

      // Stop when very close
      if (angleDiff < 0.01 && distDiff < 0.01 && upDiff < 0.01) {
        setIsResetting(false);
        camera.position.copy(targets.pos);
        camera.up.copy(targets.up);
        camera.lookAt(targets.lookAt);
        
        if (controlsRef.current) {
          controlsRef.current.reset(); // Internal reset of trackball state
          controlsRef.current.enabled = true; // Re-enable
        }
      }
    }
  });

  return (
    <>
      <TrackballControls 
        ref={controlsRef}
        noPan={true}
        rotateSpeed={4}
        zoomSpeed={1.5}
        dynamicDampingFactor={0.1}
      />

      <group ref={groupRef}>
        <TextRing 
          text="openresearchstudi" 
          radius={radius} 
          fontSize={fontSize}
          fontUrl={fontUrl}
        />
      </group>
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({ resetTrigger = 0, radius, fontSize, fontUrl }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 50 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#ffffff']} />
      
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <SceneContent resetTrigger={resetTrigger} radius={radius} fontSize={fontSize} fontUrl={fontUrl} />
    </Canvas>
  );
};