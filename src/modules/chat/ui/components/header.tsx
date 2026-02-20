"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import UserButton from "@/components/global/user-button";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { ModeToggle } from "@/components/global/mode-toggle";
import Logo from "@/components/global/logo";

interface Props {
  isLoggedIn: boolean;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
];

const Header = ({ isLoggedIn }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname()

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo & Desktop Nav */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Logo />

            <nav className="hidden md:flex">
              <ul className="flex items-center gap-1">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={clsx(
                        "rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        pathname === href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right: Auth or User */}
          <div className="hidden md:flex items-center gap-2">
            <ModeToggle />
            {isLoggedIn ? (
              <UserButton />
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/sign-in")}
                  className="text-sm"
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push("/sign-up")}
                  className="text-sm"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    pathname === href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ModeToggle />
              </div>
              {!isLoggedIn && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleLinkClick("/sign-in")}
                    className="justify-start"
                  >
                    Login
                  </Button>
                  <Button
                    
                    onClick={() => handleLinkClick("/sign-up")}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </>
              )}
              {isLoggedIn && (
                <div className="px-4 py-2">
                  <UserButton />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
