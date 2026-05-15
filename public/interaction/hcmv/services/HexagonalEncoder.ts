export class HexagonalEncoder {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gridCanvas: HTMLCanvasElement;
    private gridCtx: CanvasRenderingContext2D;
    private triangleCanvas: HTMLCanvasElement;
    private triangleCtx: CanvasRenderingContext2D;
    
    private size: number = 500;
    private padding: number = 50;
    private center: number = 250;
    // @ts-ignore - used in logic
    private maxRadius: number = 225;
    private levelSpacing: number = 0;
    private initialRadius: number = 0;
    private displayScale: number = 1;
    
    private isTouchDevice: boolean;
    private is3DMode: boolean = false;
    private rotation: { x: number; y: number } = { x: 0, y: 0 };
    private lastRotation: { x: number; y: number } = { x: 0, y: 0 };
    private targetRotation: { x: number; y: number } = { x: 0, y: 0 };
    private dragStart: { x: number; y: number } | null = null;
    private transitionProgress: number = 0;
    private previousDelta: { x: number; y: number } | null = null;
    private isAnimating: boolean = false;
    private currentText: string = "";

    // Event listeners references for cleanup
    private boundResize: () => void;
    private boundStartDrag: (e: MouseEvent | TouchEvent) => void;
    private boundDrag: (e: MouseEvent | TouchEvent) => void;
    private boundEndDrag: (e: MouseEvent | TouchEvent) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d', { 
            alpha: false,
            willReadFrequently: false 
        });
        if (!ctx) throw new Error("Could not get 2D context");
        this.ctx = ctx;

        // Font family setup
        document.body.style.fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`;

        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Offscreen canvases initialization
        this.gridCanvas = document.createElement('canvas');
        this.triangleCanvas = document.createElement('canvas');
        
        // Use alpha: true for gridCanvas to ensure smoother blending of anti-aliased lines against transparency before compositing
        const gridCtx = this.gridCanvas.getContext('2d', { 
            alpha: true 
        });
        const triangleCtx = this.triangleCanvas.getContext('2d', { 
            alpha: true
        });

        if (!gridCtx || !triangleCtx) throw new Error("Could not create offscreen contexts");
        this.gridCtx = gridCtx;
        this.triangleCtx = triangleCtx;

        this.calculateSize();
        
        // Bind methods
        this.boundResize = this.handleResize.bind(this);
        this.boundStartDrag = this.handleStartDrag.bind(this);
        this.boundDrag = this.handleDrag.bind(this);
        this.boundEndDrag = this.handleEndDrag.bind(this);

        this.setupEventListeners();
        this.resizeCanvas();
    }

    private handleResize() {
        let resizeTimeout: any;
        if (this.isTouchDevice) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.calculateSize();
                this.resizeCanvas();
                this.drawPattern(this.currentText);
            }, 100);
        } else {
            this.calculateSize();
            this.resizeCanvas();
            this.drawPattern(this.currentText);
        }
    }

    private calculateSize() {
        this.displayScale = window.devicePixelRatio || 1;
        
        // CRITICAL FIX: Measure actual DOM element size instead of guessing based on window properties.
        // This ensures the internal resolution matches the CSS rendered size 1:1, preventing scaling artifacts.
        const rect = this.canvas.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
             // Since the visualizer is square, take the smaller dimension or simply width
             this.size = Math.floor(Math.min(rect.width, rect.height));
        } else {
             // Fallback if measurement fails (unlikely)
             const screenWidth = window.innerWidth;
             const screenHeight = window.innerHeight;
             // Default to full screen min dimension to match CSS 'min(100vw, 100vh)' logic roughly
             this.size = Math.floor(Math.min(screenWidth, screenHeight));
        }
        
        this.padding = Math.min(50, this.size * 0.1);
        this.levelSpacing = (this.size - this.padding * 2) / 20;
    }

    public resizeCanvas() {
        const canvasSize = this.size * this.displayScale;
        
        [this.canvas, this.gridCanvas, this.triangleCanvas].forEach(c => {
            c.width = canvasSize;
            c.height = canvasSize;
            
            const ctx = c.getContext('2d') as CanvasRenderingContext2D;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(this.displayScale, this.displayScale);
            
            // Force high quality smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        });

        this.center = this.size / 2;
        this.maxRadius = (this.size - this.padding * 2) / 2;
        this.levelSpacing = this.maxRadius / 20;
        this.initialRadius = this.levelSpacing * 2.0;
        
        // Setup line styles for smoother rendering
        this.gridCtx.lineCap = 'round';
        this.gridCtx.lineJoin = 'round';
        this.gridCtx.lineWidth = 1; // Explicitly set line width
    }

    private hexToRgb(hex: string) {
        if (hex.length !== 7) return null;
        return {
            r: parseInt(hex.substring(1, 3), 16),
            g: parseInt(hex.substring(3, 5), 16),
            b: parseInt(hex.substring(5, 7), 16)
        };
    }

    private textToHex(text: string) {
        let result = '';
        const len = text.length;
        for (let i = 0; i < len; i++) {
            result += text.charCodeAt(i).toString(16).padStart(4, '0').toUpperCase();
        }
        return result;
    }

    private getColorCode(hexString: string, position: number) {
        let color = '#';
        const max = Math.min(position + 6, hexString.length);
        color += hexString.substring(position, max);
        if (max < position + 6) {
            color += 'F'.repeat((position + 6) - max);
        }
        return color;
    }

    private handleStartDrag(e: MouseEvent | TouchEvent) {
        if (window.TouchEvent && e instanceof TouchEvent) {
             e.preventDefault();
        }
        
        let clientX, clientY;
        if (window.TouchEvent && e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        this.is3DMode = true;
        const rect = this.canvas.getBoundingClientRect();
        this.dragStart = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
        
        if (this.transitionProgress === 0) {
            this.startTransition();
        }
    }

    private startTransition() {
        const startTime = performance.now();
        const duration = this.isTouchDevice ? 300 : 500;
        
        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            this.transitionProgress = Math.min(1, elapsed / duration);
            
            this.transitionProgress = 1 - Math.pow(1 - this.transitionProgress, 3);
            
            this.drawPattern(this.currentText);
            
            if (this.transitionProgress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    private handleDrag(e: MouseEvent | TouchEvent) {
         if (window.TouchEvent && e instanceof TouchEvent) {
             e.preventDefault();
        }

        if (!this.dragStart) return;

        let clientX, clientY;
        if (window.TouchEvent && e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        const rect = this.canvas.getBoundingClientRect();
        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        const deltaX = currentX - this.dragStart.x;
        const deltaY = currentY - this.dragStart.y;

        const rotationSensitivity = this.isTouchDevice ? 2.0 : 2;
        const dampingFactor = this.isTouchDevice ? 0.6 : 1;
        
        if (!this.previousDelta) {
            this.previousDelta = { x: 0, y: 0 };
        }
        
        const interpolationFactor = this.isTouchDevice ? 0.15 : 1;
        const smoothDeltaX = this.previousDelta.x + (deltaX - this.previousDelta.x) * interpolationFactor;
        const smoothDeltaY = this.previousDelta.y + (deltaY - this.previousDelta.y) * interpolationFactor;
        
        this.previousDelta = { x: smoothDeltaX, y: smoothDeltaY };

        const rotationFactorX = smoothDeltaY / (rect.height / 2) * 90 * rotationSensitivity * dampingFactor;
        const rotationFactorY = smoothDeltaX / (rect.width / 2) * 90 * rotationSensitivity * dampingFactor;

        if (!this.targetRotation) {
            this.targetRotation = { x: 0, y: 0 };
        }
        
        this.targetRotation.x = this.lastRotation.x + rotationFactorX;
        this.targetRotation.y = this.lastRotation.y + rotationFactorY;

        this.targetRotation.x = Math.max(-90, Math.min(90, this.targetRotation.x));
        
        const rotationInterpolationFactor = this.isTouchDevice ? 0.2 : 0.4;
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * rotationInterpolationFactor;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * rotationInterpolationFactor;

        if (this.isTouchDevice) {
            if (!this.isAnimating) {
                this.isAnimating = true;
                this.animateFrame();
            }
        } else {
            this.drawPattern(this.currentText);
        }
    }

    private animateFrame() {
        if (!this.isAnimating) return;

        this.drawPattern(this.currentText);

        if (!this.dragStart && this.previousDelta) {
            const inertiaFactor = 0.95;
            this.previousDelta.x *= inertiaFactor;
            this.previousDelta.y *= inertiaFactor;

            if (Math.abs(this.previousDelta.x) < 0.01 && Math.abs(this.previousDelta.y) < 0.01) {
                this.isAnimating = false;
                this.previousDelta = null;
                return;
            }
        }

        requestAnimationFrame(() => this.animateFrame());
    }

    private handleEndDrag(e: MouseEvent | TouchEvent) {
         if (window.TouchEvent && e instanceof TouchEvent) {
             e.preventDefault();
        }
        if (this.dragStart) {
            this.lastRotation = { ...this.rotation };
            this.dragStart = null;
            
            if (this.isTouchDevice && this.previousDelta) {
                const velocity = Math.sqrt(
                    Math.pow(this.previousDelta.x, 2) + 
                    Math.pow(this.previousDelta.y, 2)
                );
                
                if (velocity > 0.1) {
                    this.isAnimating = true;
                }
            }
        }
    }

    private getVertexPoint(level: number, vertexIndex: number): [number, number] {
        const angle = Math.PI / 3 * vertexIndex - Math.PI / 2;
        const isMobile = this.isTouchDevice;
        const sizeMultiplier = isMobile ? 1.5 : 1.0;
        
        if (!this.is3DMode) {
            const radius = (this.initialRadius + (level * this.levelSpacing * 0.9)) * 0.5 * sizeMultiplier;
            const x = this.center + radius * Math.cos(angle);
            const y = this.center + radius * Math.sin(angle);
            return [x, y];
        } else {
            const radius2D = (this.initialRadius + (level * this.levelSpacing * 0.9)) * 0.5 * sizeMultiplier;
            const x2D = this.center + radius2D * Math.cos(angle);
            const y2D = this.center + radius2D * Math.sin(angle);
            
            const baseRadius = (this.initialRadius + (this.levelSpacing * 4)) * 0.5 * 1.3 * sizeMultiplier;
            const x3D = baseRadius * Math.cos(angle);
            const y3D = baseRadius * Math.sin(angle);
            const z3D = -level * this.levelSpacing * 1.8 * 0.5 * 1.3 * sizeMultiplier;

            const centerLevel = 7;
            const centerZ = -centerLevel * this.levelSpacing * 1.8 * 0.5 * 1.3 * sizeMultiplier;

            let rotX = (this.rotation.x * Math.PI / 180) * this.transitionProgress;
            let rotY = (this.rotation.y * Math.PI / 180) * this.transitionProgress;

            const relativeZ = z3D - centerZ;

            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const rotatedX1 = x3D * cosY - relativeZ * sinY;
            const rotatedZ1 = relativeZ * cosY + x3D * sinY;

            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const rotatedY2 = y3D * cosX - rotatedZ1 * sinX;
            const rotatedZ2 = rotatedZ1 * cosX + y3D * sinX;

            const perspective = isMobile ? 400 : 800;
            const scale = perspective / (perspective + rotatedZ2 + centerZ);
            const enhancedScale = Math.pow(scale, isMobile ? 1.4 : 1.2);
            
            const x3DFinal = this.center + rotatedX1 * enhancedScale;
            const y3DFinal = this.center + rotatedY2 * enhancedScale;

            return [
                x2D + (x3DFinal - x2D) * this.transitionProgress,
                y2D + (y3DFinal - y2D) * this.transitionProgress
            ];
        }
    }

    public drawPattern(text: string) {
        this.currentText = text;
        
        [this.ctx, this.gridCtx, this.triangleCtx].forEach(ctx => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(this.displayScale, this.displayScale);
        });
        
        // Ensure main canvas background is black
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.size, this.size);
        
        // Clear offscreen canvases
        this.gridCtx.clearRect(0, 0, this.size, this.size);
        this.triangleCtx.clearRect(0, 0, this.size, this.size);

        if (this.is3DMode) {
            this.draw3DGrid();
        } else {
            this.draw2DGrid();
        }

        if (text) {
            this.drawTextPattern(text);
        }

        this.ctx.drawImage(this.gridCanvas, 0, 0, this.size, this.size);
        this.ctx.drawImage(this.triangleCanvas, 0, 0, this.size, this.size);
    }

    private draw3DGrid() {
        const maxLevel = 15;
        const gridPoints = [];
        for (let level = 0; level <= maxLevel; level++) {
            const levelPoints = [];
            for (let i = 0; i <= 6; i++) {
                levelPoints.push(this.getVertexPoint(level, i % 6));
            }
            gridPoints.push({ level, points: levelPoints });
        }

        gridPoints.sort((a, b) => {
            const zA = -a.level * this.levelSpacing * 1.8;
            const zB = -b.level * this.levelSpacing * 1.8;
            return zB - zA;
        });

        gridPoints.forEach(({ level, points }) => {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(points[0][0], points[0][1]);
            points.forEach(point => {
                this.gridCtx.lineTo(point[0], point[1]);
            });
            this.gridCtx.strokeStyle = '#333333';
            this.gridCtx.stroke();
        });
    }

    private draw2DGrid() {
        const maxLevel = 15;
        for (let level = 0; level <= maxLevel; level++) {
            this.gridCtx.beginPath();
            for (let i = 0; i <= 6; i++) {
                const point = this.getVertexPoint(level, i % 6);
                if (i === 0) {
                    this.gridCtx.moveTo(point[0], point[1]);
                } else {
                    this.gridCtx.lineTo(point[0], point[1]);
                }
            }
            this.gridCtx.strokeStyle = '#333333';
            this.gridCtx.stroke();
        }
    }

    private drawTextPattern(text: string) {
        const hexString = this.textToHex(text);
        const points = [];
        const colors = [];

        const maxPoints = hexString.length;
        for (let i = 0; i < maxPoints; i++) {
            const level = Math.min(parseInt(hexString[i], 16), 15);
            const vertexIndex = i % 6;
            points.push(this.getVertexPoint(level, vertexIndex));
            colors.push(this.getColorCode(hexString, i));
        }

        if (points.length >= 3) {
            this.triangleCtx.save();
            if (!this.isTouchDevice) {
                this.triangleCtx.globalCompositeOperation = 'screen';
            }

            for (let i = 0; i < points.length - 2; i++) {
                this.drawGradientTriangle([
                    points[i],
                    points[i + 1],
                    points[i + 2]
                ], [
                    colors[i],
                    colors[i + 1],
                    colors[i + 2]
                ]);
            }

            this.triangleCtx.restore();
        }
    }

    private setupEventListeners() {
        window.addEventListener('resize', this.boundResize);

        if (this.isTouchDevice) {
            let lastTouchTime = 0;
            const touchThrottle = 1000 / 120;
            
            this.canvas.addEventListener('touchstart', (e) => {
                this.boundStartDrag(e);
                lastTouchTime = performance.now();
            }, { passive: false });
            
            this.canvas.addEventListener('touchmove', (e) => {
                const now = performance.now();
                if (now - lastTouchTime >= touchThrottle) {
                    this.boundDrag(e);
                    lastTouchTime = now;
                }
            }, { passive: false });
            
            this.canvas.addEventListener('touchend', (e) => {
                this.boundEndDrag(e);
            }, { passive: false });
        } else {
            this.canvas.addEventListener('mousedown', this.boundStartDrag);
            this.canvas.addEventListener('mousemove', this.boundDrag);
            this.canvas.addEventListener('mouseup', this.boundEndDrag);
            this.canvas.addEventListener('mouseleave', this.boundEndDrag);
        }
    }

    public cleanup() {
        window.removeEventListener('resize', this.boundResize);
        
        if (!this.isTouchDevice) {
            this.canvas.removeEventListener('mousedown', this.boundStartDrag);
            this.canvas.removeEventListener('mousemove', this.boundDrag);
            this.canvas.removeEventListener('mouseup', this.boundEndDrag);
            this.canvas.removeEventListener('mouseleave', this.boundEndDrag);
        }
    }

    public toggle2D() {
        if (this.is3DMode) {
            this.startTransitionTo2D();
        } else {
            this.is3DMode = true;
            this.startTransition();
        }
    }

    private startTransitionTo2D() {
        const startTime = performance.now();
        const duration = this.isTouchDevice ? 300 : 500;
        const startRotation = { ...this.rotation };
        
        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.rotation.x = startRotation.x * (1 - easeProgress);
            this.rotation.y = startRotation.y * (1 - easeProgress);
            
            this.transitionProgress = 1 - easeProgress;
            
            this.drawPattern(this.currentText);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.is3DMode = false;
                this.rotation = { x: 0, y: 0 };
                this.lastRotation = { x: 0, y: 0 };
            }
        };
        
        requestAnimationFrame(animate);
    }

    private drawGradientTriangle(points: [number, number][], colors: string[]) {
        const ctx = this.triangleCtx;
        
        const path = new Path2D();
        path.moveTo(points[0][0], points[0][1]);
        path.lineTo(points[1][0], points[1][1]);
        path.lineTo(points[2][0], points[2][1]);
        path.closePath();

        if (this.isTouchDevice) {
            const gradient = ctx.createLinearGradient(
                points[0][0], points[0][1],
                points[2][0], points[2][1]
            );
            
            colors.forEach((color, index) => {
                const rgb = this.hexToRgb(color);
                if (rgb) {
                    gradient.addColorStop(index / 2, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
                }
            });

            ctx.fillStyle = gradient;
            ctx.fill(path);
        } else {
            const meshGradient = ctx.createConicGradient(0, points[0][0], points[0][1]);
            
            colors.forEach((color, index) => {
                const rgb = this.hexToRgb(color);
                if (rgb) {
                    const stop = index / colors.length;
                    meshGradient.addColorStop(stop, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
                }
            });
            
            const firstRgb = this.hexToRgb(colors[0]);
            if (firstRgb) {
                 meshGradient.addColorStop(1, `rgba(${firstRgb.r}, ${firstRgb.g}, ${firstRgb.b}, 1)`);
            }

            ctx.fillStyle = meshGradient;
            ctx.fill(path);
        }
    }
}