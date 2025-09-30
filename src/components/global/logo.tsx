import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

const Logo = ({ className, width, height }: { className?: string, width?: number, height?: number }) => {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme;
  return (
    <Link href={"/"} >
      <Image
        src={currentTheme === "dark" ? "/wavely-logo-dark-mode.png" : "/wavely-logo.png"}
        alt="wavely logo"
        width={width || 120}
        height={height || 120}
        className={className}
      />
    </Link>
  );
};

export default Logo;
