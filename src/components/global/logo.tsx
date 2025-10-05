"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Logo = ({ className, width, height }: { className?: string; width?: number; height?: number }) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Prevent hydration mismatch by not rendering until theme is known
    return (
      <Link href="/">
        <Image
          src="/wavely-logo.png"
          alt="wavely logo"
          width={width || 120}
          height={height || 120}
          className={className}
        />
      </Link>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? "/wavely-logo-dark-mode.png" : "/wavely-logo.png";

  return (
    <Link href="/">
      <Image
        src={logoSrc}
        alt="wavely logo"
        width={width || 120}
        height={height || 120}
        className={className}
      />
    </Link>
  );
};

export default Logo;
