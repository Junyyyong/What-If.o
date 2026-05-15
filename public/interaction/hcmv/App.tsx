import React, { useEffect, useRef, useState } from 'react';
import { HexagonalEncoder } from './services/HexagonalEncoder';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const encoderRef = useRef<HexagonalEncoder | null>(null);
  const [inputText, setInputText] = useState('');
  
  useEffect(() => {
    if (canvasRef.current && !encoderRef.current) {
      encoderRef.current = new HexagonalEncoder(canvasRef.current);
      // Initial draw
      encoderRef.current.drawPattern('');
    }

    return () => {
      if (encoderRef.current) {
        encoderRef.current.cleanup();
      }
    };
  }, []);

  // Handle text input with debounce matching the original logic
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (encoderRef.current) {
        encoderRef.current.drawPattern(inputText);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [inputText]);

  const handleResetClick = () => {
    if (encoderRef.current) {
      encoderRef.current.toggle2D();
    }
  };

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen box-border overflow-hidden bg-black touch-none">
      {/* 
        Canvas Styling:
        Original: width: min(100vw, 100vh); height: min(100vw, 100vh);
        Mobile: 110% scale
        Tablet: 135% scale
        4K: 80% scale
        Landscape mobile: 100vh
        Small mobile: 130% scale
      */}
      <canvas
        ref={canvasRef}
        id="patternCanvas"
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black touch-none 
          perspective-1000 preserve-3d will-change-transform
          
          /* Default (Desktop) */
          w-[min(100vw,100vh)] h-[min(100vw,100vh)]

          /* 4K (min-width: 2560px and min-height: 1440px) */
          @[media(min-width:2560px)_and_(min-height:1440px)]:w-[min(80vw,80vh)]
          @[media(min-width:2560px)_and_(min-height:1440px)]:h-[min(80vw,80vh)]

          /* Tablet (768px - 1024px) */
          @[media(min-width:768px)_and_(max-width:1024px)]:w-[min(135vw,135vh)]
          @[media(min-width:768px)_and_(max-width:1024px)]:h-[min(135vw,135vh)]

          /* Mobile (max-width: 767px) */
          @[media(max-width:767px)]:w-[min(110vw,110vh)]
          @[media(max-width:767px)]:h-[min(110vw,110vh)]

          /* Landscape (max-height: 500px) */
          @[media(max-height:500px)]:w-[100vh]
          @[media(max-height:500px)]:h-[100vh]

          /* Small Screen (max-width: 320px) */
          @[media(max-width:320px)]:w-[min(130vw,130vh)]
          @[media(max-width:320px)]:h-[min(130vw,130vh)]
        `}
      />

      <input
        type="text"
        id="textInput"
        placeholder="Type something..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className={`
          fixed left-1/2 -translate-x-1/2 text-center bg-black text-white rounded outline-none z-10
          
          /* Default */
          bottom-[min(8vh,60px)]
          w-[clamp(280px,min(90vw,500px),500px)]
          p-[min(2vh,12px)]
          text-[clamp(14px,min(2.5vw,16px),16px)]

          /* 4K */
          @[media(min-width:2560px)_and_(min-height:1440px)]:text-[min(18px,1.5vh)]
          @[media(min-width:2560px)_and_(min-height:1440px)]:p-[min(15px,1.5vh)]
          @[media(min-width:2560px)_and_(min-height:1440px)]:w-[min(600px,30vw)]

          /* Tablet */
          @[media(min-width:768px)_and_(max-width:1024px)]:w-[min(70vw,500px)]
          @[media(min-width:768px)_and_(max-width:1024px)]:text-[min(16px,2.5vw)]

          /* Mobile */
          @[media(max-width:767px)]:w-[min(85vw,400px)]
          @[media(max-width:767px)]:text-[min(16px,3vw)]
          @[media(max-width:767px)]:p-[min(12px,2vh)]

          /* Landscape */
          @[media(max-height:500px)]:bottom-[min(40px,8vh)]
          @[media(max-height:500px)]:p-[min(8px,1.6vh)]

          /* Small Screen */
          @[media(max-width:320px)]:w-[90vw]
          @[media(max-width:320px)]:text-[min(14px,4vw)]
          @[media(max-width:320px)]:p-[min(8px,2vh)]
        `}
      />

      <button
        id="reset2DButton"
        title="Reset to 2D View"
        onClick={handleResetClick}
        className={`
          fixed left-1/2 -translate-x-1/2 p-0 border-none bg-transparent cursor-pointer z-10 flex items-center justify-center tap-highlight-transparent
          
          /* Default */
          bottom-[min(3vh,20px)]
          w-[clamp(40px,min(8vw,48px),48px)]
          h-[clamp(40px,min(8vw,48px),48px)]

          /* 4K */
          @[media(min-width:2560px)_and_(min-height:1440px)]:w-[min(56px,3vw)]
          @[media(min-width:2560px)_and_(min-height:1440px)]:h-[min(56px,3vw)]

          /* Landscape */
          @[media(max-height:500px)]:bottom-[min(8px,1.6vh)]
        `}
      >
        <svg
          viewBox="0 0 24 24"
          className={`
            stroke-[#666] stroke-2 fill-none transition-colors duration-200
            hover:stroke-[#999] active:stroke-[#bbb]

            /* Default */
            w-[clamp(24px,min(5vw,28px),28px)]
            h-[clamp(24px,min(5vw,28px),28px)]

            /* 4K */
            @[media(min-width:2560px)_and_(min-height:1440px)]:w-[min(32px,1.7vw)]
            @[media(min-width:2560px)_and_(min-height:1440px)]:h-[min(32px,1.7vw)]
          `}
        >
          <path d="M12 3 L20 8 L20 16 L12 21 L4 16 L4 8 Z" />
        </svg>
      </button>
    </div>
  );
};

export default App;