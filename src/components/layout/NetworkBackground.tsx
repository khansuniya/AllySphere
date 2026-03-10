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
  rotation: number;
}

// Outlined SVG icon paths (LinkedIn-style networking icons)
const ICONS: Record<string, { paths: string[]; stroke?: boolean }> = {
  chat: {
    paths: [
      'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6l-4 4V6c0-1.1.9-2 2-2z',
      'M8 10h.01M12 10h.01M16 10h.01',
    ],
    stroke: true,
  },
  briefcase: {
    paths: [
      'M20 7H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z',
      'M16 7V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2',
    ],
    stroke: true,
  },
  trophy: {
    paths: [
      'M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18',
      'M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22',
      'M17 22c0-2-.85-3.25-2.03-3.79A1.09 1.09 0 0114 17v-2.34',
      'M18 2H6v7a6 6 0 1012 0V2z',
    ],
    stroke: true,
  },
  userPlus: {
    paths: [
      'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2',
      'M20 8v6M23 11h-6',
    ],
    stroke: true,
  },
  user: {
    paths: [
      'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2',
    ],
    stroke: true,
  },
  idCard: {
    paths: [
      'M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z',
      'M7 12h.01M7 16h4M13 12h4M13 16h2',
    ],
    stroke: true,
  },
  search: {
    paths: [
      'M21 21l-4.35-4.35M10 17a7 7 0 100-14 7 7 0 000 14z',
    ],
    stroke: true,
  },
  building: {
    paths: [
      'M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15',
      'M9 9h1M9 13h1M15 9h1M15 13h1',
    ],
    stroke: true,
  },
  medal: {
    paths: [
      'M12 15a5 5 0 100-10 5 5 0 000 10z',
      'M8.21 13.89L7 23l5-3 5 3-1.21-9.12',
      'M12 8l1 1.5H14.5L13 11l.5 2L12 12l-1.5 1 .5-2-1.5-1.5H12L12 8z',
    ],
    stroke: true,
  },
};

const ICON_KEYS = Object.keys(ICONS);

const NetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const generateNodes = useCallback((w: number, h: number): Node[] => {
    const area = w * h;
    const count = Math.min(Math.max(Math.floor(area / 55000), 10), 40);
    const nodes: Node[] = [];

    // Use poisson-like spacing to avoid clumps
    const cellSize = Math.sqrt(area / count);
    const cols = Math.ceil(w / cellSize);
    const rows = Math.ceil(h / cellSize);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const x = (col + 0.2 + Math.random() * 0.6) * cellSize;
      const y = (row + 0.2 + Math.random() * 0.6) * cellSize;

      nodes.push({
        x, y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        icon: ICON_KEYS[Math.floor(Math.random() * ICON_KEYS.length)],
        size: 28 + Math.random() * 16,
        opacity: 0.08 + Math.random() * 0.07,
        phase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.3,
      });
    }
    return nodes;
  }, []);

  const drawIcon = useCallback((ctx: CanvasRenderingContext2D, iconKey: string, x: number, y: number, size: number, opacity: number) => {
    const icon = ICONS[iconKey];
    if (!icon) return;

    ctx.save();
    ctx.translate(x, y);
    const scale = size / 24;
    ctx.scale(scale, scale);
    ctx.translate(-12, -12);
    ctx.globalAlpha = opacity;

    // Light blue-grey color matching reference
    ctx.strokeStyle = 'hsl(205, 30%, 78%)';
    ctx.fillStyle = 'hsl(205, 30%, 85%)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const pathData of icon.paths) {
      const path = new Path2D(pathData);
      if (icon.stroke) {
        ctx.stroke(path);
      } else {
        ctx.fill(path);
      }
    }

    // Add subtle circle background for some icons
    if (iconKey === 'userPlus' || iconKey === 'user') {
      ctx.beginPath();
      ctx.arc(9, 7, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

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

    // Update node positions
    for (const node of nodes) {
      node.x = node.baseX + Math.sin(time * 0.00025 + node.phase) * 6;
      node.y = node.baseY + Math.cos(time * 0.0003 + node.phase) * 5;

      node.baseX += node.vx;
      node.baseY += node.vy;

      if (node.baseX < -40) node.baseX = w + 40;
      if (node.baseX > w + 40) node.baseX = -40;
      if (node.baseY < -40) node.baseY = h + 40;
      if (node.baseY > h + 40) node.baseY = -40;

      // Subtle cursor parallax
      const dx = node.x - mouse.x;
      const dy = node.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180 && dist > 0) {
        const force = (180 - dist) / 180 * 8;
        node.x += (dx / dist) * force;
        node.y += (dy / dist) * force;
      }
    }

    // Draw connecting lines (thin, light blue-grey)
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 280;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `hsla(205, 35%, 75%, ${alpha})`;
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

    // Small dots at node centers
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(205, 35%, 80%, ${node.opacity * 1.2})`;
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
