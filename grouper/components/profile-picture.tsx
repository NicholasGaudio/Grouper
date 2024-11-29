import Image from "next/image";
import { User } from "lucide-react";
import { useState } from "react";

interface ProfilePictureProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

export function ProfilePicture({ src, alt, size = 40, className = "" }: ProfilePictureProps) {
  const [error, setError] = useState(false);

  if (!src?.startsWith('http') || error || !src?.trim()) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <User className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
} 