import { useEffect, useState, useRef, useMemo, ReactNode } from 'react';

const TIMEZONES = [
  { label: 'SEOUL', value: 'Asia/Seoul', accessory: 'seoul' },
  { label: 'TOKYO', value: 'Asia/Tokyo', accessory: 'tokyo' },
  { label: 'BEIJING', value: 'Asia/Shanghai', accessory: 'beijing' },
  { label: 'BANGKOK', value: 'Asia/Bangkok', accessory: 'bangkok' },
  { label: 'MUMBAI', value: 'Asia/Kolkata', accessory: 'mumbai' },

  { label: 'DUBAI', value: 'Asia/Dubai', accessory: 'dubai' },
  { label: 'MOSCOW', value: 'Europe/Moscow', accessory: 'moscow' },
  { label: 'ISTANBUL', value: 'Europe/Istanbul', accessory: 'istanbul' },
  { label: 'CAIRO', value: 'Africa/Cairo', accessory: 'cairo' },
  { label: 'ROME', value: 'Europe/Rome', accessory: 'rome' },

  { label: 'BERLIN', value: 'Europe/Berlin', accessory: 'berlin' },
  { label: 'PARIS', value: 'Europe/Paris', accessory: 'paris' },
  { label: 'LONDON', value: 'Europe/London', accessory: 'london' },
  { label: 'MADRID', value: 'Europe/Madrid', accessory: 'madrid' },
  { label: 'SYDNEY', value: 'Australia/Sydney', accessory: 'sydney' },

  { label: 'NEW YORK', value: 'America/New_York', accessory: 'newyork' },
  { label: 'TORONTO', value: 'America/Toronto', accessory: 'toronto' },
  { label: 'MEXICO CITY', value: 'America/Mexico_City', accessory: 'mexico' },
  { label: 'SAO PAULO', value: 'America/Sao_Paulo', accessory: 'saopaulo' },
  { label: 'BUENOS AIRES', value: 'America/Argentina/Buenos_Aires', accessory: 'buenosaires' },
];

const getOffsetMs = (timeZone: string) => {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone }));
    return tzDate.getTime() - utcDate.getTime();
  } catch (e) {
    return 0;
  }
};

const Accessories: Record<string, ReactNode> = {
  seoul: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 20 40 Q 50 45 80 40 M 35 40 C 35 10, 65 10, 65 40" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  tokyo: (
    <svg viewBox="0 0 100 50" className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 10 40 Q 50 50 90 40" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="45" r="6" fill="black" />
    </svg>
  ),
  beijing: (
    <svg viewBox="0 0 100 50" className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 20 45 C 20 20, 80 20, 80 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="15" r="5" fill="black" />
    </svg>
  ),
  bangkok: (
    <svg viewBox="0 0 100 50" className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 10 45 L 50 5 L 90 45 Z" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 30 45 L 50 25 L 70 45" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mumbai: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 20 45 C 10 20, 40 10, 50 25 C 60 10, 90 20, 80 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 30 45 Q 50 20 70 45" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  dubai: (
    <svg viewBox="0 0 100 50" className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 15 45 Q 50 35 85 45" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <path d="M 18 38 Q 50 28 82 38" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  moscow: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 25 45 L 25 20 C 25 10, 75 10, 75 20 L 75 45 M 25 25 L 15 25 L 15 45 L 25 45 M 75 25 L 85 25 L 85 45 L 75 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  istanbul: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 35 45 L 40 15 L 60 15 L 65 45 Z" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 50 15 Q 70 10 80 30" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cairo: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 30 10 C 10 10, 15 50, 15 50 L 35 40 L 35 10 M 70 10 C 90 10, 85 50, 85 50 L 65 40 L 65 10 M 35 10 Q 50 5 65 10" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  rome: (
    <svg viewBox="0 0 100 50" className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 15 40 C 10 10, 50 5, 50 5 C 50 5, 90 10, 85 40" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <path d="M 25 25 Q 30 15 40 20 M 75 25 Q 70 15 60 20 M 20 35 Q 30 25 40 30 M 80 35 Q 70 25 60 30" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  berlin: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 20 45 C 30 45, 35 15, 50 15 C 65 15, 70 45, 80 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 65 30 Q 80 10 90 5" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  paris: (
    <svg viewBox="0 0 100 50" className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 25 40 C 20 20, 80 15, 75 40 C 60 45, 40 45, 25 40 Z M 50 20 L 55 10" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  london: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 25 45 Q 50 48 75 45 M 35 45 L 35 15 Q 50 10 65 15 L 65 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  madrid: (
    <svg viewBox="0 0 100 50" className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 20 45 C 10 25, 40 25, 50 35 C 60 25, 90 25, 80 45 Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sydney: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 20 45 C 20 20, 40 10, 45 45 M 40 45 C 40 15, 60 5, 65 45 M 60 45 C 60 25, 75 15, 80 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  newyork: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 20 45 Q 50 50 80 45 M 50 45 L 50 10 M 35 43 L 25 15 M 65 43 L 75 15 M 42 44 L 35 12 M 58 44 L 65 12" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  toronto: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 25 45 C 25 15, 75 15, 75 45 Z" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="12" r="6" fill="white" stroke="black" strokeWidth="2" />
      <path d="M 20 45 L 80 45" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  mexico: (
    <svg viewBox="0 0 100 50" className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[100px] h-[50px] z-20 overflow-visible">
      <path d="M 10 45 Q 50 55 90 45" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <path d="M 35 45 L 40 15 C 40 5, 60 5, 60 15 L 65 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  saopaulo: (
    <svg viewBox="0 0 100 50" className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 50 45 Q 30 20 50 5 Q 70 20 50 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 40 45 Q 10 25 30 10 Q 50 25 40 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 60 45 Q 90 25 70 10 Q 50 25 60 45" fill="white" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  buenosaires: (
    <svg viewBox="0 0 100 50" className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[80px] h-[40px] z-20 overflow-visible">
      <path d="M 15 45 L 85 45" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <path d="M 35 45 L 35 20 L 65 20 L 65 45 Z" fill="white" stroke="black" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
};

function Clock({ time, timeZone, label, accessory, mousePos, isMouseDown }: any) {
  const offsetMs = useMemo(() => getOffsetMs(timeZone), [timeZone]);
  const zonedTime = new Date(time.getTime() + offsetMs);

  const hours = zonedTime.getUTCHours();
  const minutes = zonedTime.getUTCMinutes();
  const seconds = zonedTime.getUTCSeconds();
  const milliseconds = time.getMilliseconds();

  const smoothSeconds = seconds + milliseconds / 1000;
  const smoothMinutes = minutes + smoothSeconds / 60;
  const smoothHours = (hours % 12) + smoothMinutes / 60;

  const hourAngle = smoothHours * 30;
  const minuteAngle = smoothMinutes * 6;
  const secondAngle = smoothSeconds * 6;

  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftPupilPos = useRef({ x: 0, y: 0 });
  const rightPupilPos = useRef({ x: 0, y: 0 });

  // Calculate targets
  let leftTarget = { x: 0, y: 0 };
  let rightTarget = { x: 0, y: 0 };
  const maxDist = 10; // (36 eye - 10 pupil) / 2 = 13, minus padding = 10

  if (!isMouseDown) {
    // Clock Mode: Left = Minute, Right = Second
    leftTarget.x = Math.cos((minuteAngle - 90) * Math.PI / 180) * maxDist;
    leftTarget.y = Math.sin((minuteAngle - 90) * Math.PI / 180) * maxDist;
    rightTarget.x = Math.cos((secondAngle - 90) * Math.PI / 180) * maxDist;
    rightTarget.y = Math.sin((secondAngle - 90) * Math.PI / 180) * maxDist;
  } else {
    // Follow Mode: Look at mouse
    if (leftEyeRef.current && rightEyeRef.current) {
      const lRect = leftEyeRef.current.getBoundingClientRect();
      const rRect = rightEyeRef.current.getBoundingClientRect();

      const lCenterX = lRect.left + lRect.width / 2;
      const lCenterY = lRect.top + lRect.height / 2;
      const rCenterX = rRect.left + rRect.width / 2;
      const rCenterY = rRect.top + rRect.height / 2;

      const dxL = mousePos.x - lCenterX;
      const dyL = mousePos.y - lCenterY;
      const distL = Math.min(maxDist, Math.hypot(dxL, dyL));
      const angleL = Math.atan2(dyL, dxL);
      leftTarget.x = Math.cos(angleL) * distL;
      leftTarget.y = Math.sin(angleL) * distL;

      const dxR = mousePos.x - rCenterX;
      const dyR = mousePos.y - rCenterY;
      const distR = Math.min(maxDist, Math.hypot(dxR, dyR));
      const angleR = Math.atan2(dyR, dxR);
      rightTarget.x = Math.cos(angleR) * distR;
      rightTarget.y = Math.sin(angleR) * distR;
    }
  }

  // Lerp
  leftPupilPos.current.x += (leftTarget.x - leftPupilPos.current.x) * 0.15;
  leftPupilPos.current.y += (leftTarget.y - leftPupilPos.current.y) * 0.15;
  rightPupilPos.current.x += (rightTarget.x - rightPupilPos.current.x) * 0.15;
  rightPupilPos.current.y += (rightTarget.y - rightPupilPos.current.y) * 0.15;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-[160px] h-[160px] flex items-center justify-center">
        {/* Accessory */}
        {Accessories[accessory]}

        {/* Perfect Circle Face */}
        <div className="absolute inset-0 bg-white border-2 border-black rounded-full z-10 flex items-center justify-center">

          {/* Center dot (optional, helps visualize the center) */}
          <div className="w-1.5 h-1.5 bg-black rounded-full absolute opacity-20"></div>

          {/* Eye Group (Hour Indicator) */}
          <div
            className="absolute w-[72px] h-[72px]"
            style={{
              transform: `rotate(${hourAngle}deg) translateY(-38px) rotate(${-hourAngle}deg)`
            }}
          >
            {/* Left Eye (Minute) - Top Left */}
            <div
              ref={leftEyeRef}
              className="absolute top-0 left-0 w-[36px] h-[36px] bg-white border-2 border-black rounded-full flex items-center justify-center"
            >
              <div
                className="w-[10px] h-[10px] bg-black rounded-full"
                style={{
                  transform: `translate(${leftPupilPos.current.x}px, ${leftPupilPos.current.y}px)`
                }}
              ></div>
            </div>

            {/* Right Eye (Second) - Bottom Right */}
            <div
              ref={rightEyeRef}
              className="absolute bottom-0 right-0 w-[36px] h-[36px] bg-white border-2 border-black rounded-full flex items-center justify-center"
            >
              <div
                className="w-[10px] h-[10px] bg-black rounded-full"
                style={{
                  transform: `translate(${rightPupilPos.current.x}px, ${rightPupilPos.current.y}px)`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="font-bold tracking-widest text-xs text-black">{label}</div>
    </div>
  );
}

export default function App() {
  const [time, setTime] = useState(new Date());
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const targetMousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const animate = () => {
    setTime(new Date());

    // Smooth mouse interpolation
    setMousePos(prev => ({
      x: prev.x + (targetMousePos.current.x - prev.x) * 0.2,
      y: prev.y + (targetMousePos.current.y - prev.y) * 0.2
    }));

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    targetMousePos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleMouseMove = (e: MouseEvent) => {
      targetMousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans select-none"
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
      onTouchStart={() => setIsMouseDown(true)}
      onTouchEnd={() => setIsMouseDown(false)}
    >
      <div className="absolute top-8 text-xs font-bold tracking-widest text-gray-400 animate-pulse">
        {isMouseDown ? "FOLLOW MODE" : "CLOCK MODE (CLICK AND HOLD TO FOLLOW)"}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-6 gap-y-20 mt-12 w-full px-12 place-items-center">
        {TIMEZONES.map(tz => (
          <Clock
            key={tz.value}
            time={time}
            timeZone={tz.value}
            label={tz.label}
            accessory={tz.accessory}
            mousePos={mousePos}
            isMouseDown={isMouseDown}
          />
        ))}
      </div>
    </div>
  );
}
