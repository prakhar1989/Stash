"use client";

import { Folder, FileText, Image as ImageIcon, Link as LinkIcon, Music, Video } from "lucide-react";
import { useEffect, useState } from "react";

export function StashAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex h-[300px] w-full items-center justify-center sm:h-[400px]">
      {/* Central Folder */}
      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-2xl shadow-primary/30 transition-transform duration-500 hover:scale-110 sm:h-32 sm:w-32">
        <Folder className="h-12 w-12 text-primary-foreground sm:h-16 sm:w-16" />

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 animate-pulse rounded-3xl bg-primary/20 blur-xl" />
      </div>

      {/* Floating Items */}
      <FloatingItem delay={0} angle={0} icon={<FileText />} />
      <FloatingItem delay={1.2} angle={72} icon={<ImageIcon />} />
      <FloatingItem delay={2.4} angle={144} icon={<LinkIcon />} />
      <FloatingItem delay={3.6} angle={216} icon={<Music />} />
      <FloatingItem delay={4.8} angle={288} icon={<Video />} />
    </div>
  );
}

function FloatingItem({
  delay,
  angle,
  icon,
}: {
  delay: number;
  angle: number;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border bg-card text-card-foreground shadow-lg"
      style={{
        animation: `orbit-in 6s infinite linear`,
        animationDelay: `${delay}s`,
        // Custom property for the angle to be used in keyframes if we were using CSS modules,
        // but here we'll use inline styles for the transform origin/rotation
        transform: `rotate(${angle}deg) translateX(140px) rotate(-${angle}deg)`,
      }}
    >
      <div className="h-6 w-6">{icon}</div>
      <style jsx>{`
        @keyframes orbit-in {
          0% {
            opacity: 0;
            transform: rotate(${angle}deg) translateX(180px) rotate(-${angle}deg) scale(0.5);
          }
          10% {
            opacity: 1;
            transform: rotate(${angle}deg) translateX(140px) rotate(-${angle}deg) scale(1);
          }
          70% {
            opacity: 1;
            transform: rotate(${angle + 40}deg) translateX(100px) rotate(-${angle + 40}deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2);
          }
        }
      `}</style>
    </div>
  );
}
