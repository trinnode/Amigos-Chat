// Matrix-style background animation component
// Creates falling green characters effect for cyberpunk aesthetic

import React, { useEffect, useRef } from "react";

/**
 * MatrixBackground Component
 * Renders animated falling characters like in The Matrix
 * Purely decorative - sits behind all content
 */
const MatrixBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size to window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    // Matrix characters - mix of katakana, numbers, and symbols
    const characters =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";
    const charArray = characters.split("");

    // Column settings
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0); // Y position of each column

    // Drawing function
    const drawMatrix = () => {
      // Semi-transparent black background for fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = "#00ff00"; // Bright green
      ctx.font = `${fontSize}px Fira Code, monospace`;

      // Draw characters for each column
      for (let i = 0; i < drops.length; i++) {
        // Random character from our set
        const char = charArray[Math.floor(Math.random() * charArray.length)];

        // Draw the character
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Random chance to reset column or continue falling
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0; // Reset to top
        } else {
          drops[i]++; // Continue falling
        }
      }
    };

    // Animation loop
    const animate = () => {
      drawMatrix();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      // Recalculate columns for new width
      const newColumns = Math.floor(canvas.width / fontSize);
      drops.length = newColumns;
      drops.fill(0);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{
        opacity: 0.15, // Keep it subtle so text remains readable
        background: "transparent",
      }}
    />
  );
};

export default MatrixBackground;
