import { useEffect, useRef } from 'react';

// Geometric ambient particles — rectangles and circles
const SHAPE_COLORS = ['#435836', '#B3AEB4', '#D0CAAC'] as const;
const MAX_PARTICLES = 30;

type ShapeType = 'rect-green' | 'rect-gray' | 'circle';

interface GeoParticle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: ShapeType;
  size: number;
}

function randomShape(): ShapeType {
  const r = Math.random();
  if (r < 0.33) return 'rect-green';
  if (r < 0.66) return 'rect-gray';
  return 'circle';
}

export default function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<GeoParticle[]>([]);
  const animRef = useRef<number>(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticle = (startTop = true): GeoParticle => ({
      x: Math.random() * canvas.width,
      y: startTop ? -40 : Math.random() * canvas.height,
      size: 30,
      speedY: Math.random() * 0.4 + 0.15,
      speedX: Math.random() * 0.3 - 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.005,
      opacity: Math.random() * 0.35 + 0.15,
      shape: randomShape(),
    });

    for (let i = 0; i < MAX_PARTICLES; i++) {
      particlesRef.current.push(createParticle(false));
    }

    const getColor = (shape: ShapeType): string => {
      switch (shape) {
        case 'rect-green': return SHAPE_COLORS[0];
        case 'rect-gray': return SHAPE_COLORS[1];
        case 'circle': return SHAPE_COLORS[2];
      }
    };

    const drawParticle = (p: GeoParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = getColor(p.shape);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.008) * 0.2;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height + 40) {
          Object.assign(p, createParticle(true));
        }
        drawParticle(p);
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  if (reducedMotion.current) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
}
