// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

export default function FloatingIcon({ icon, x, y, depth, delay }) {
  const mvX = useMotionValue(x);
  const mvY = useMotionValue(y);

  const targetX = useRef(x);
  const targetY = useRef(y);

  const smooth = (a, b, speed = 0.08) => a + (b - a) * speed;

  useEffect(() => {
    let t = 0;
    let frame;

    const run = () => {
      t += 0.02;

      const waveX = Math.cos(t + delay) * 12;
      const waveY = Math.sin(t + delay) * 14;

      mvX.set(smooth(mvX.get(), targetX.current + waveX));
      mvY.set(smooth(mvY.get(), targetY.current + waveY));

      frame = requestAnimationFrame(run);
    };

    run();
    return () => cancelAnimationFrame(frame);
  }, [delay, mvX, mvY]);

  useEffect(() => {
    const handle = (e) => {
      const px = (e.clientX / window.innerWidth - 0.5) * 2;
      const py = (e.clientY / window.innerHeight - 0.5) * 2;

      targetX.current = x + px * depth * 25;
      targetY.current = y + py * depth * 25;
    };

    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [depth, x, y]);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        translateX: "-50%",
        translateY: "-50%",
        x: mvX,
        y: mvY,
        pointerEvents: "none",
        opacity: 0.9,
      }}
    >
      {icon}
    </motion.div>
  );
}
