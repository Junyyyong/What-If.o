import React, { useMemo } from 'react';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface TextRingProps {
  text: string;
  radius: number;
  fontSize?: number;
  fontUrl?: string;
}

export const TextRing: React.FC<TextRingProps> = ({ 
  text, 
  radius, 
  fontSize = 0.5,
  fontUrl = "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
}) => {
  const letters = useMemo(() => {
    const chars = text.split('');
    // Full circle split by number of characters
    const angleStep = (Math.PI * 2) / chars.length;

    return chars.map((char, i) => {
      // Start from 12 o'clock (PI/2) and move Clockwise (subtract angle)
      const theta = Math.PI / 2 - i * angleStep;
      
      // Position on the circle (XY plane)
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      const z = 0;

      // Return array [x, y, z] which is safer for R3F props than mutable Vector3 objects
      const position: [number, number, number] = [x, y, z];

      return {
        char,
        position,
      };
    });
  }, [text, radius]);

  return (
    <group>
      {letters.map((item, index) => (
        // Billboard ensures the text always faces the camera
        <Billboard
          key={index}
          position={item.position}
        >
          <Text
            fontSize={fontSize}
            color="black"
            anchorX="center"
            anchorY="middle"
            font={fontUrl}
          >
            {item.char}
          </Text>
        </Billboard>
      ))}
    </group>
  );
};