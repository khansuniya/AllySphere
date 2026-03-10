import React, { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  icon: string;
  size: number;
  opacity: number;
  phase: number;
}

// SVG path data for minimal networking icons
const ICON_PATHS: Record<string, string> = {
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  message: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',
  search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  building: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
  trophy: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
};

const ICON_KEYS = Object.keys(ICON_PATHS);

const NetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const generateNodes = useCallback((w: number, h: number): Node[] => {
    const area = w * h;
    const count = Math.min(Math.max(Math.floor(area / 45000), 12), 50);
    const nodes: Node[] = [];
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      nodes.push({
        x, y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        icon: ICON_KEYS[Math.floor(Math.random() * ICON_KEYS.length)],
        size: 14 + Math.random() * 8,
        opacity: 0.04 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return nodes;
  }, []);

  const drawIcon = useCallback((ctx: CanvasRenderingContext2D, iconKey: string, x: number, y: number, size: number, opacity: number) => {
    ctx.save();
    ctx.translate(x - size / 2, y - size / 2);
    const scale = size / 24;
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;
    
    // Use the primary palette color (lime green tones)
    ctx.fillStyle = 'hsl(80, 50%, 45%)';
    ctx.strokeStyle = 'hsl(80, 50%, 45%)';
    ctx.lineWidth = 0.5;
    
    const path = new Path2D(ICON_PATHS[iconKey]);
    ctx.fill(path);
    ctx.restore();
  }, []);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;
    const nodes = nodesRef.current;
    const mouse = mouseRef.current;

    ctx.clearRect(0, 0, w, h);

    // Update positions with gentle floating + cursor parallax
    for (const node of nodes) {
      // Gentle floating
      node.x = node.baseX + Math.sin(time * 0.0003 + node.phase) * 8;
      node.y = node.baseY + Math.cos(time * 0.0004 + node.phase) * 6;

      // Slow drift
      node.baseX += node.vx;
      node.baseY += node.vy;

      // Wrap around edges
      if (node.baseX < -30) node.baseX = w + 30;
      if (node.baseX > w + 30) node.baseX = -30;
      if (node.baseY < -30) node.baseY = h + 30;
      if (node.baseY > h + 30) node.baseY = -30;

      // Subtle cursor repulsion/parallax
      const dx = node.x - mouse.x;
      const dy = node.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && dist > 0) {
        const force = (200 - dist) / 200 * 12;
        node.x += (dx / dist) * force;
        node.y += (dy / dist) * force;
      }
    }

    // Draw connecting lines between nearby nodes
    ctx.lineWidth = 0.5;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 220;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.06;
          ctx.strokeStyle = `hsla(80, 40%, 50%, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw icons
    for (const node of nodes) {
      drawIcon(ctx, node.icon, node.x, node.y, node.size, node.opacity);
    }

    // Draw small dots at some connection intersections
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(80, 50%, 50%, ${node.opacity * 1.5})`;
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [drawIcon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = document.documentElement.scrollHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      
      dimensionsRef.current = { w, h };
      nodesRef.current = generateNodes(w, h);
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    rafRef.current = requestAnimationFrame(draw);

    // Observe body height changes to resize canvas
    const ro = new ResizeObserver(handleResize);
    ro.observe(document.body);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [generateNodes, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
};

export default NetworkBackground;
