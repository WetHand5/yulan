import { useEffect, useRef, useState } from 'react';

interface MagieUniverseProps {
  images: { src: string; alt: string }[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  src: string;
  alt: string;
  dragging: boolean;
}

export default function MagieUniverse({ images }: MagieUniverseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [ready, setReady] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = containerRef.current;
    if (!container || images.length === 0) return;

    const initParticles = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const particles: Particle[] = [];
      const sizeBase = Math.max(60, Math.min(cw * 0.12, 120));

      images.forEach((img, i) => {
        const w = sizeBase + Math.random() * sizeBase * 0.4;
        const h = w * 1.1;
        const x = Math.random() * (cw - w);
        const y = Math.random() * (ch - h);
        const speed = 0.3 + Math.random() * 0.4;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          id: i,
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w, h,
          src: img.src,
          alt: img.alt,
          dragging: false,
        });
      });
      particlesRef.current = particles;
      setReady(true);
    };

    initParticles();

    const FRICTION = 0.998;
    const BOUNCE = 0.8;
    const REPULSION = 0.5;

    const animate = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const particles = particlesRef.current;

      for (const p of particles) {
        if (p.dragging) continue;

        p.x += p.vx;
        p.y += p.vy;

        // Wall bounce
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * BOUNCE; }
        if (p.x + p.w > cw) { p.x = cw - p.w; p.vx = -Math.abs(p.vx) * BOUNCE; }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * BOUNCE; }
        if (p.y + p.h > ch) { p.y = ch - p.h; p.vy = -Math.abs(p.vy) * BOUNCE; }

        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Keep minimum drift
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.15) {
          const angle = Math.random() * Math.PI * 2;
          p.vx += Math.cos(angle) * 0.05;
          p.vy += Math.sin(angle) * 0.05;
        }
      }

      // Simple collision between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const acx = a.x + a.w / 2;
          const acy = a.y + a.h / 2;
          const bcx = b.x + b.w / 2;
          const bcy = b.y + b.h / 2;

          const dx = bcx - acx;
          const dy = bcy - acy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.w + b.w) / 2;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            // Push apart
            if (!a.dragging && !b.dragging) {
              a.x -= nx * overlap * REPULSION;
              a.y -= ny * overlap * REPULSION;
              b.x += nx * overlap * REPULSION;
              b.y += ny * overlap * REPULSION;
            } else if (a.dragging) {
              b.x += nx * overlap;
              b.y += ny * overlap;
            } else {
              a.x -= nx * overlap;
              a.y -= ny * overlap;
            }

            // Velocity exchange (simplified elastic)
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;

            if (dot > 0) {
              if (!a.dragging) {
                a.vx -= dot * nx * BOUNCE;
                a.vy -= dot * ny * BOUNCE;
              }
              if (!b.dragging) {
                b.vx += dot * nx * BOUNCE;
                b.vy += dot * ny * BOUNCE;
              }
            }
          }
        }
      }

      // Update DOM
      for (const p of particles) {
        const el = document.getElementById(`magie-p-${p.id}`);
        if (el) {
          el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    if (!reducedMotion.current) {
      animate();
    }

    const handleDown = (clientX: number, clientY: number, target: HTMLElement) => {
      const particle = particlesRef.current.find(p => target.id === `magie-p-${p.id}` || target.closest(`#magie-p-${p.id}`));
      if (!particle) return;
      const rect = container.getBoundingClientRect();
      particle.dragging = true;
      dragRef.current = {
        id: particle.id,
        offsetX: clientX - rect.left - particle.x,
        offsetY: clientY - rect.top - particle.y,
      };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!dragRef.current) return;
      const rect = container.getBoundingClientRect();
      const p = particlesRef.current[dragRef.current.id];
      if (!p) return;
      const newX = clientX - rect.left - dragRef.current.offsetX;
      const newY = clientY - rect.top - dragRef.current.offsetY;
      p.vx = (newX - p.x) * 0.3;
      p.vy = (newY - p.y) * 0.3;
      p.x = newX;
      p.y = newY;
    };

    const handleUp = () => {
      if (dragRef.current !== null) {
        const p = particlesRef.current[dragRef.current.id];
        if (p) p.dragging = false;
        dragRef.current = null;
      }
    };

    const onMouseDown = (e: MouseEvent) => handleDown(e.clientX, e.clientY, e.target as HTMLElement);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      handleDown(t.clientX, t.clientY, e.target as HTMLElement);
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      cancelAnimationFrame(animRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [images]);

  return (
    <div
      ref={containerRef}
      className="magie-universe relative w-full mx-auto overflow-hidden"
      style={{ height: '700px', maxWidth: '72rem' }}
    >
      {ready && particlesRef.current.map((p) => (
        <div
          key={p.id}
          id={`magie-p-${p.id}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: p.w,
            height: p.h,
            transform: `translate(${p.x}px, ${p.y}px)`,
            cursor: 'grab',
            userSelect: 'none',
   touchAction: 'none',
          }}
        >
          <img
            src={p.src}
            alt={p.alt}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}