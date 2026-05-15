
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const colorPalette = [
  { color: new THREE.Color('#e84f35'), weight: 0.45 },
  { color: new THREE.Color('#302872'), weight: 0.45 },
  { color: new THREE.Color('#ffcb00'), weight: 0.10 },
];

// Pre-calculate cumulative weights for weighted random selection
const cumulativeWeights: number[] = [];
colorPalette.reduce((acc, item) => {
  const newWeight = acc + item.weight;
  cumulativeWeights.push(newWeight);
  return newWeight;
}, 0);

const getRandomColor = (): THREE.Color => {
  const rand = Math.random();
  const index = cumulativeWeights.findIndex(w => rand < w);
  
  // 1. 원본 팔레트에서 색상을 가져오되, 원본을 보호하기 위해 복제(clone)합니다.
  const baseColor = colorPalette[index !== -1 ? index : colorPalette.length - 1].color.clone();

  // 2. HSL 정보를 추출합니다.
  const hsl = { h: 0, s: 0, l: 0 };
  baseColor.getHSL(hsl);

  // 3. 채도(Saturation)를 1.5배 높입니다. (최대값 1.0을 넘지 않도록 제한)
  hsl.s = Math.min(hsl.s * 1.5, 1.0); 

  // 4. 변경된 HSL 값을 다시 색상에 적용합니다.
  baseColor.setHSL(hsl.h, hsl.s, hsl.l);

  // 5. 수정된 색상을 반환합니다.
  return baseColor;
};

// Increased from 500 to 1500 to allow trails to last 3x longer without cutting off
const MAX_POINTS = 1500; 

const App: React.FC = () => {
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastVolumeRef = useRef(0);
  
  // Initialize audio automatically
  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        inputAudioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        source.connect(analyser);
      } catch (err) {
        console.error("Failed to initialize audio:", err);
      }
    };

    initAudio();

    // Browser autoplay policy fix: resume audio context on first user interaction
    const handleInteraction = () => {
      if (inputAudioContextRef.current && inputAudioContextRef.current.state === 'suspended') {
        inputAudioContextRef.current.resume();
      }
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close().catch(console.error);
        }
    };
  }, []);
  
  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);
    
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(mountNode.clientWidth, mountNode.clientHeight), 1.0, 0.5, 0.2);
    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_POINTS * 3);
    const colors = new Float32Array(MAX_POINTS * 3);
    const alphas = new Float32Array(MAX_POINTS);
    const creationTimes = new Float32Array(MAX_POINTS);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('creationTime', new THREE.BufferAttribute(creationTimes, 1));
    
    const lineVertexShader = `
      attribute float alpha;
      attribute float creationTime;
      varying float vAlpha;
      varying vec3 vColor;
      varying float vCreationTime;
      void main() {
        vAlpha = alpha;
        vColor = color;
        vCreationTime = creationTime;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const lineFragmentShader = `
      uniform float uTime;
      varying float vAlpha;
      varying vec3 vColor;
      varying float vCreationTime;
      void main() {
        float flashDuration = 0.3;
        float timeSinceCreation = uTime - vCreationTime;
        
        // Intensity goes from 1.0 to 0.0 over flashDuration
        float flashIntensity = 1.0 - smoothstep(0.0, flashDuration, timeSinceCreation);
        
        // Add brightness to the original color. pow makes the fade-out quicker.
        float brightnessBoost = pow(flashIntensity, 2.0) * 1.5; 
        vec3 boostedColor = vColor + vec3(brightnessBoost);

        float shimmer = (sin(uTime * 8.0 + vAlpha * 30.0) + 1.0) / 2.0 * 0.4 + 0.6;
        gl_FragColor = vec4(boostedColor * shimmer, vAlpha);
      }
    `;

    const lineMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0.0 } },
        vertexShader: lineVertexShader,
        fragmentShader: lineFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    const line = new THREE.Line(geometry, lineMaterial);
    line.frustumCulled = false; 
    scene.add(line);

    const pointsVertexShader = `
      attribute float alpha;
      attribute float creationTime;
      uniform float uTime;
      varying float vAlpha;
      varying vec3 vColor;
      varying float vCreationTime;
      void main() {
        vAlpha = alpha;
        vColor = color;
        vCreationTime = creationTime;
        
        float pointSize = alpha * 25.0;
        
        float effectDuration = 0.3;
        float timeSinceCreation = uTime - creationTime;
        float effectIntensity = 1.0 - smoothstep(0.0, effectDuration, timeSinceCreation);
        
        // Smoothly increase size from 1x to 2x and back
        float sizeMultiplier = 1.0 + pow(effectIntensity, 3.0); 
        pointSize *= sizeMultiplier;

        gl_PointSize = pointSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const pointsFragmentShader = `
      uniform float uTime;
      varying float vAlpha;
      varying vec3 vColor;
      varying float vCreationTime;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        float flashDuration = 0.3;
        float timeSinceCreation = uTime - vCreationTime;
        float flashIntensity = 1.0 - smoothstep(0.0, flashDuration, timeSinceCreation);
        
        float brightnessBoost = pow(flashIntensity, 2.0) * 1.5;
        vec3 boostedColor = vColor + vec3(brightnessBoost);

        float twinkle = (sin(uTime * 10.0 + vColor.r * 100.0) + 1.0) / 2.0 * 0.5 + 0.5;
        gl_FragColor = vec4(boostedColor, vAlpha * (1.0 - dist * 2.0) * twinkle);
      }
    `;

    const pointsMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0.0 } },
        vertexShader: pointsVertexShader,
        fragmentShader: pointsFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    const points = new THREE.Points(geometry, pointsMaterial);
    points.frustumCulled = false;
    scene.add(points);

    const meshGeometry = new THREE.BufferGeometry();
    const meshPositions = new Float32Array((MAX_POINTS - 2) * 3 * 3);
    const meshColors = new Float32Array((MAX_POINTS - 2) * 3 * 3);
    const meshCreationTimes = new Float32Array((MAX_POINTS - 2) * 3);
    
    meshGeometry.setAttribute('position', new THREE.BufferAttribute(meshPositions, 3));
    meshGeometry.setAttribute('color', new THREE.BufferAttribute(meshColors, 3));
    meshGeometry.setAttribute('creationTime', new THREE.BufferAttribute(meshCreationTimes, 1));
    
    const meshVertexShader = `
      varying vec3 vColor;
      attribute float creationTime;
      varying float vCreationTime;
      void main() {
        vColor = color;
        vCreationTime = creationTime;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const meshFragmentShader = `
      uniform float uTime;
      varying vec3 vColor;
      varying float vCreationTime;
      void main() {
        float flashDuration = 0.3;
        float timeSinceCreation = uTime - vCreationTime;
        float flashIntensity = 1.0 - smoothstep(0.0, flashDuration, timeSinceCreation);
        
        // Boost brightness of the original color
        float brightnessBoost = pow(flashIntensity, 2.0) * 1.5;
        vec3 boostedColor = vColor + vec3(brightnessBoost);
        
        // Also increase opacity during the flash for a "thicker" feel
        float finalAlpha = 0.5 + (0.5 * flashIntensity); // goes from 1.0 to 0.5

        gl_FragColor = vec4(boostedColor, finalAlpha); 
      }
    `;

    const meshMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0.0 } },
      vertexShader: meshVertexShader,
      fragmentShader: meshFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const ribbonMesh = new THREE.Mesh(meshGeometry, meshMaterial);
    ribbonMesh.frustumCulled = false;
    scene.add(ribbonMesh);

    const clock = new THREE.Clock();
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    const worldOrigin = new THREE.Vector3(0, 0, 0);

    const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        
        // Camera logic moved up to calculate direction for audio reaction
        const radius = 40; 
        const rotationSpeed = 0.065;
        const angle = elapsedTime * rotationSpeed;
        const camDirX = Math.sin(angle);
        const camDirZ = Math.cos(angle);

        for (let i = MAX_POINTS - 1; i > 0; i--) {
            positions[i * 3] = positions[(i - 1) * 3];
            positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
            positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
            colors[i * 3] = colors[(i - 1) * 3];
            colors[i * 3 + 1] = colors[(i - 1) * 3 + 1];
            colors[i * 3 + 2] = colors[(i - 1) * 3 + 2];
            alphas[i] = alphas[i - 1];
            creationTimes[i] = creationTimes[i - 1];
        }

        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

            if (volume > 5) {
                const lowEnd = Math.floor(dataArray.length * 0.1);
                const midEnd = Math.floor(dataArray.length * 0.4);
                const lowFreq = dataArray.slice(0, lowEnd).reduce((a, b) => a + b, 0) / lowEnd;
                const midFreq = dataArray.slice(lowEnd, midEnd).reduce((a, b) => a + b, 0) / (midEnd - lowEnd);
                const highFreq = dataArray.slice(midEnd).reduce((a, b) => a + b, 0) / (dataArray.length - midEnd);

                // Scale increased by 1.5x (75 * 1.5 = 112.5) to increase distance between points
                const scale = 112.5; 
                const noiseFactor = 5.0;
                const noiseX = (Math.sin(elapsedTime * 0.9) * Math.cos(elapsedTime * 1.5) + Math.sin(elapsedTime * 2.2)) * noiseFactor;
                const noiseY = (Math.cos(elapsedTime * 0.7) * Math.sin(elapsedTime * 1.3) + Math.cos(elapsedTime * 2.4)) * noiseFactor;
                const noiseZ = (Math.sin(elapsedTime * 0.8) * Math.cos(elapsedTime * 1.1) + Math.sin(elapsedTime * 2.3)) * noiseFactor;

                // Volume change calculation moved before position setting
                const volumeChange = Math.abs(volume - lastVolumeRef.current);
                
                // Surge effect: Move points towards the camera based on volume change.
                // Clamped to 30 to prevent points from flying off-screen or hitting the camera lens too hard.
                const surgeAmount = Math.min(volumeChange * 1.2, 30); 

                const newPosition = new THREE.Vector3(
                    (lowFreq / 255 - 0.5) * scale * 1.5 + noiseX + (camDirX * surgeAmount),
                    (midFreq / 255 - 0.5) * scale + noiseY,
                    (highFreq / 255 - 0.5) * scale * 1.5 + noiseZ + (camDirZ * surgeAmount)
                );

                positions[0] = newPosition.x;
                positions[1] = newPosition.y;
                positions[2] = newPosition.z;

                const newColor = getRandomColor();
                colors[0] = newColor.r; colors[1] = newColor.g; colors[2] = newColor.b;
                alphas[0] = Math.min(volume / 30, 1.0);
                creationTimes[0] = elapsedTime;

                const highPitchContribution = (highFreq / 255.0) * 2.0;
                const volumeChangeContribution = Math.min((volumeChange / 30.0), 3.0);
                
                lastVolumeRef.current = volume;
                
                const baseStrength = 0.8;
                const targetStrength = baseStrength + highPitchContribution + volumeChangeContribution;
                bloomPass.strength = THREE.MathUtils.lerp(bloomPass.strength, targetStrength, 0.1);

            } else {
                positions[0] = positions[3]; positions[1] = positions[4]; positions[2] = positions[5];
                colors[0] = colors[3]; colors[1] = colors[4]; colors[2] = colors[5];
                alphas[0] *= 0.95;
                creationTimes[0] = creationTimes[1];
            }
        } else {
            positions[0] = positions[3]; positions[1] = positions[4]; positions[2] = positions[5];
            alphas[0] = 0; 
            creationTimes[0] = creationTimes[1];
            bloomPass.strength = THREE.MathUtils.lerp(bloomPass.strength, 0.8, 0.1);
        }

        for (let i = 0; i < MAX_POINTS; i++) {
            // Decay decreased from 0.992 to 0.9975 for roughly 3x longer life
            alphas[i] *= 0.9975;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;
        geometry.attributes.creationTime.needsUpdate = true;
        
        const meshPositionsArray = (meshGeometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        const meshColorsArray = (meshGeometry.attributes.color as THREE.BufferAttribute).array as Float32Array;
        const meshCreationTimesArray = (meshGeometry.attributes.creationTime as THREE.BufferAttribute).array as Float32Array;

        for (let i = 0; i < MAX_POINTS - 2; i++) {
            const v1_base = i * 3;
            const v2_base = (i + 1) * 3;
            const v3_base = (i + 2) * 3;

            const mesh_v1_base = i * 9;
            const mesh_v2_base = i * 9 + 3;
            const mesh_v3_base = i * 9 + 6;

            meshPositionsArray[mesh_v1_base + 0] = positions[v1_base + 0];
            meshPositionsArray[mesh_v1_base + 1] = positions[v1_base + 1];
            meshPositionsArray[mesh_v1_base + 2] = positions[v1_base + 2];
            meshColorsArray[mesh_v1_base + 0] = colors[v1_base + 0] * alphas[i];
            meshColorsArray[mesh_v1_base + 1] = colors[v1_base + 1] * alphas[i];
            meshColorsArray[mesh_v1_base + 2] = colors[v1_base + 2] * alphas[i];

            meshPositionsArray[mesh_v2_base + 0] = positions[v2_base + 0];
            meshPositionsArray[mesh_v2_base + 1] = positions[v2_base + 1];
            meshPositionsArray[mesh_v2_base + 2] = positions[v2_base + 2];
            meshColorsArray[mesh_v2_base + 0] = colors[v2_base + 0] * alphas[i + 1];
            meshColorsArray[mesh_v2_base + 1] = colors[v2_base + 1] * alphas[i + 1];
            meshColorsArray[mesh_v2_base + 2] = colors[v2_base + 2] * alphas[i + 1];

            meshPositionsArray[mesh_v3_base + 0] = positions[v3_base + 0];
            meshPositionsArray[mesh_v3_base + 1] = positions[v3_base + 1];
            meshPositionsArray[mesh_v3_base + 2] = positions[v3_base + 2];
            meshColorsArray[mesh_v3_base + 0] = colors[v3_base + 0] * alphas[i + 2];
            meshColorsArray[mesh_v3_base + 1] = colors[v3_base + 1] * alphas[i + 2];
            meshColorsArray[mesh_v3_base + 2] = colors[v3_base + 2] * alphas[i + 2];

            const meshVertexIndex = i * 3;
            meshCreationTimesArray[meshVertexIndex + 0] = creationTimes[i];
            meshCreationTimesArray[meshVertexIndex + 1] = creationTimes[i + 1];
            meshCreationTimesArray[meshVertexIndex + 2] = creationTimes[i + 2];
        }

        meshGeometry.attributes.position.needsUpdate = true;
        meshGeometry.attributes.color.needsUpdate = true;
        meshGeometry.attributes.creationTime.needsUpdate = true;

        lineMaterial.uniforms.uTime.value = elapsedTime;
        pointsMaterial.uniforms.uTime.value = elapsedTime;
        meshMaterial.uniforms.uTime.value = elapsedTime;

        const centerOfMass = new THREE.Vector3();
        let visiblePoints = 0;
        for (let i = 0; i < MAX_POINTS; i++) {
            if (alphas[i] > 0.01) {
                centerOfMass.add(new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]));
                visiblePoints++;
            }
        }
        
        if (visiblePoints > 0) {
            centerOfMass.divideScalar(visiblePoints);
            cameraTarget.lerp(centerOfMass, 0.05);
        } else {
            cameraTarget.lerp(worldOrigin, 0.02);
        }
        
        const desiredCameraPosition = new THREE.Vector3(
            cameraTarget.x + Math.sin(angle) * radius,
            cameraTarget.y + 5,
            cameraTarget.z + Math.cos(angle) * radius
        );
        
        camera.position.lerp(desiredCameraPosition, 0.1);
        camera.lookAt(cameraTarget);

        composer.render();
    };

    animate();

    const handleResize = () => {
        if (!mountNode) return; // Safety check
        const { clientWidth, clientHeight } = mountNode;
        renderer.setSize(clientWidth, clientHeight);
        composer.setSize(clientWidth, clientHeight);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        window.removeEventListener('resize', handleResize);
        if (mountNode && renderer.domElement.parentNode === mountNode) {
            mountNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        line.geometry.dispose();
        points.geometry.dispose();
        ribbonMesh.geometry.dispose();
        (line.material as THREE.Material).dispose();
        (points.material as THREE.Material).dispose();
        (ribbonMesh.material as THREE.Material).dispose();
    };
  }, []);

  return (
    <div className="bg-[#090a0f] text-white w-full h-screen overflow-hidden relative font-sans">
        <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />
    </div>
  );
};

export default App;
