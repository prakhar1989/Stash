"use client";

interface FaviconProps {
  src: string;
  alt?: string;
  className?: string;
}

export function Favicon({
  src,
  alt = "",
  className = "w-8 h-8",
}: FaviconProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
