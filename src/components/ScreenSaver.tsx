import React, { useEffect, useRef } from 'react';
export function ScreenSaver() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // Create bouncing logo
    const logo = {
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      dx: 2,
      dy: 2,
      image: new Image()
    };
    logo.image.src = "/toiral.png";
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw logo
      ctx.drawImage(logo.image, logo.x, logo.y, logo.width, logo.height);
      // Update position
      logo.x += logo.dx;
      logo.y += logo.dy;
      // Bounce off walls
      if (logo.x + logo.width > canvas.width || logo.x < 0) {
        logo.dx = -logo.dx;
      }
      if (logo.y + logo.height > canvas.height || logo.y < 0) {
        logo.dy = -logo.dy;
      }
      requestAnimationFrame(animate);
    };
    // Start animation when image loads
    logo.image.onload = () => {
      animate();
    };
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  return <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>;
}