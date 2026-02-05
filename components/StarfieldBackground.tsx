import React, { useEffect, useRef } from 'react';

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{ x: number; y: number; z: number; size: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize stars
    const starCount = 200;
    starsRef.current = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 0.5, // Depth factor for parallax
      size: Math.random() * 2
    }));

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position -1 to 1
      mouseRef.current = {
        x: (e.clientX / width) * 2 - 1,
        y: (e.clientY / height) * 2 - 1
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw nebulous glow (simple gradient)
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
      gradient.addColorStop(0, 'rgba(11, 13, 23, 0)');
      gradient.addColorStop(1, 'rgba(20, 0, 50, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      ctx.fillStyle = '#FFF';
      starsRef.current.forEach(star => {
        // Parallax offset
        const offsetX = mouseRef.current.x * 20 * star.z;
        const offsetY = mouseRef.current.y * 20 * star.z;

        // Slow drift
        star.y -= 0.05 * star.z;
        if (star.y < 0) star.y = height;

        ctx.beginPath();
        ctx.arc(star.x + offsetX, star.y + offsetY, star.size * Math.random(), 0, Math.PI * 2);
        ctx.fill();
        
        // Twinkle
        if (Math.random() > 0.99) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "white";
        } else {
            ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60 mix-blend-screen"
    />
  );
};

export default StarfieldBackground;