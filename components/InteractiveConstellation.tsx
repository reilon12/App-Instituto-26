
import React, { useRef, useEffect } from 'react';

// Define the type for the theme accent color
interface InteractiveConstellationProps {
  accentColor: string;
}

const InteractiveConstellation: React.FC<InteractiveConstellationProps> = ({ accentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particlesArray: Particle[] = [];
    
    // Get theme colors from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    let particleColor = computedStyle.getPropertyValue('--color-constellation-particle').trim();
    let bgStartColor = computedStyle.getPropertyValue('--color-constellation-bg-start').trim();
    let bgEndColor = computedStyle.getPropertyValue('--color-constellation-bg-end').trim();

    const mouse = { x: -200, y: -200, radius: 150 };
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      baseX: number;
      baseY: number;

      constructor(x: number, y: number, size: number, speedX: number, speedY: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.baseX = this.x;
        this.baseY = this.y;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = particleColor;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        if (!canvas) return;
        // Wall collision
        if (this.x + this.size > canvas.width || this.x - this.size < 0) this.speedX = -this.speedX;
        if (this.y + this.size > canvas.height || this.y - this.size < 0) this.speedY = -this.speedY;

        this.x += this.speedX;
        this.y += this.speedY;
        
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius && distance > 0) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = forceDirectionX * force * 1.5;
            const directionY = forceDirectionY * force * 1.5;
            this.x -= directionX;
            this.y -= directionY;
        } else {
            // Return to base position for a 'breathing' effect
            if (this.x !== this.baseX) {
                const dx_base = this.x - this.baseX;
                this.x -= dx_base / 20;
            }
            if (this.y !== this.baseY) {
                const dy_base = this.y - this.baseY;
                this.y -= dy_base / 20;
            }
        }
      }
    }

    const init = () => {
      particlesArray = [];
      if (!canvas) return;
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 1.5 + 1;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        const speedX = Math.random() * 0.4 - 0.2;
        const speedY = Math.random() * 0.4 - 0.2;
        particlesArray.push(new Particle(x, y, size, speedX, speedY));
      }
    };

    const connect = () => {
        if (!ctx || !canvas) return;
        const connectDistance = Math.min(canvas.width, canvas.height) / 6;
        const connectDistanceSq = connectDistance * connectDistance;
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const particleA = particlesArray[a];
                const particleB = particlesArray[b];
                if (!particleA || !particleB) continue;

                const distanceSq = (particleA.x - particleB.x) ** 2 + (particleA.y - particleB.y) ** 2;

                if (distanceSq < connectDistanceSq) {
                    const opacityValue = 1 - (distanceSq / connectDistanceSq);
                    
                    let r = 192, g = 154, b = 88; // Default to gold
                    if (accentColor && accentColor.startsWith('#')) {
                        const hexColor = accentColor.substring(1);
                        r = parseInt(hexColor.slice(0, 2), 16);
                        g = parseInt(hexColor.slice(2, 4), 16);
                        b = parseInt(hexColor.slice(4, 6), 16);
                    }

                    ctx.strokeStyle = `rgba(${r},${g},${b},${opacityValue * 0.9})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particleA.x, particleA.y);
                    ctx.lineTo(particleB.x, particleB.y);
                    ctx.stroke();
                }
            }
        }
    };
    
    const animate = () => {
      if (!ctx || !canvas) return;
      
      const newComputedStyle = getComputedStyle(document.documentElement);
      particleColor = newComputedStyle.getPropertyValue('--color-constellation-particle').trim();
      bgStartColor = newComputedStyle.getPropertyValue('--color-constellation-bg-start').trim();
      bgEndColor = newComputedStyle.getPropertyValue('--color-constellation-bg-end').trim();
      
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
      gradient.addColorStop(0, bgStartColor);
      gradient.addColorStop(1, bgEndColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const particle of particlesArray) {
        particle.update();
        particle.draw();
      }
      ctx.shadowBlur = 0; // Reset shadow for lines
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }

    handleResize();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [accentColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        transition: 'background-color 0.5s ease',
      }}
    />
  );
};

export default InteractiveConstellation;
