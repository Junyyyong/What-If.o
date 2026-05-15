import React, { useState, useRef } from 'react';
import { Scene } from './components/Scene';

// Define available fonts with their online URLs for Three.js
// Only keeping Inter as requested.
const fontOptions = [
  { name: 'Inter', url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' },
];

const App: React.FC = () => {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [radius, setRadius] = useState(3);
  const [fontSize, setFontSize] = useState(0.6);
  
  // Font State
  const [selectedFontUrl, setSelectedFontUrl] = useState(fontOptions[0].url);
  const [customFontName, setCustomFontName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reference for the animation loop to allow cancellation
  const animationFrameRef = useRef<number>(0);

  const handleReset = () => {
    // Trigger camera reset in Scene
    setResetTrigger((prev) => prev + 1);
    
    // Target values
    const targetRadius = 3;
    const targetFontSize = 0.6;

    // Cancel any existing animation
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    let currentRadius = radius;
    let currentFontSize = fontSize;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1); // Cap delta
      lastTime = time;

      // Use a lerp factor similar to the camera's speed (factor of 4) for consistent feel
      const t = 4 * delta;

      // Linear interpolation: current = current + (target - current) * factor
      currentRadius = currentRadius + (targetRadius - currentRadius) * t;
      currentFontSize = currentFontSize + (targetFontSize - currentFontSize) * t;

      setRadius(currentRadius);
      setFontSize(currentFontSize);

      // Check completion (thresholds)
      const diffRadius = Math.abs(targetRadius - currentRadius);
      const diffFontSize = Math.abs(targetFontSize - currentFontSize);

      if (diffRadius < 0.005 && diffFontSize < 0.001) {
        // Snap to final values
        setRadius(targetRadius);
        setFontSize(targetFontSize);
        animationFrameRef.current = 0;
      } else {
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleRadiusChange = (val: number) => {
    // If user interacts, stop the auto-reset animation
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setRadius(val);
  };

  const handleFontSizeChange = (val: number) => {
    // If user interacts, stop the auto-reset animation
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setFontSize(val);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a temporary URL for the uploaded file
      const objectUrl = URL.createObjectURL(file);
      setSelectedFontUrl(objectUrl);
      setCustomFontName(file.name);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Determine if the current font is one of the presets
  const isCustomFont = !fontOptions.some(f => f.url === selectedFontUrl);

  return (
    <div className="relative w-full h-screen bg-white">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene 
          resetTrigger={resetTrigger} 
          radius={radius} 
          fontSize={fontSize}
          fontUrl={selectedFontUrl} 
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end p-8">
        
        {/* Footer / Instructions */}
        <footer className="flex flex-col sm:flex-row justify-end items-end gap-4">
          <div className="flex flex-col gap-4 items-end pointer-events-auto w-full sm:w-64">
            
            {/* Controls Container */}
            <div className="flex flex-col gap-4 bg-white/80 backdrop-blur-md p-4 border border-gray-100 rounded-xl shadow-sm w-full">
              
              {/* Font Selector */}
              <div className="flex flex-col gap-2">
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".ttf,.otf,.woff,.woff2"
                  className="hidden"
                />

                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-black focus:border-black block p-2 appearance-none cursor-pointer truncate pr-8"
                      onChange={(e) => setSelectedFontUrl(e.target.value)}
                      value={selectedFontUrl}
                    >
                      {fontOptions.map((font) => (
                        <option key={font.name} value={font.url}>
                          {font.name}
                        </option>
                      ))}
                      {/* Show custom option if active */}
                      {isCustomFont && (
                        <option value={selectedFontUrl}>
                          Custom: {customFontName}
                        </option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  <button 
                    onClick={triggerFileUpload}
                    className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-colors border border-dashed border-gray-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Font (.ttf/otf)
                  </button>
                </div>
              </div>

              {/* Font Size Slider */}
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-xs font-['Space_Mono'] text-gray-500 uppercase">
                  <span>Font Size</span>
                  <span>{fontSize.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2.0" 
                  step="0.1" 
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Spacing Slider */}
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-xs font-['Space_Mono'] text-gray-500 uppercase">
                  <span>Letter Spacing</span>
                  <span>{(radius * 10).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="1.5" 
                  max="6" 
                  step="0.1" 
                  value={radius}
                  onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              <div className="h-px bg-gray-100 my-1"></div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center">
                <button 
                  onClick={handleReset}
                  className="bg-gray-100 hover:bg-gray-200 text-black p-2 rounded-md transition-colors shadow-sm"
                  aria-label="Reset View"
                  title="Reset View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;