"use client";;
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "@/components/global/logo";
import UserButton from "@/components/global/user-button";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { ModeToggle } from "@/components/global/mode-toggle";

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
    <header className="px-6 py-4  bg-background">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Desktop Nav */}
        <div className="flex items-center  gap-8">
          <Logo />
          <nav className="hidden md:block">
            <ul className="flex gap-6  ">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      clsx(
                        "hover:underline  opacity-80 transition-colors",
                        pathname === href && " opacity-100 underline"

                      )
                    }

                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right: Auth or User */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          {isLoggedIn ? (
            <UserButton />
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/sign-in")}
              >
                Login
              </Button>
              <Button size="sm" onClick={() => router.push("/sign-up")}>
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
          className="md:hidden p-2 rounded-md hover:bg-muted"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {
        isOpen && (
          <div className="md:hidden mt-4 border-t pt-4">
            <ul className="flex flex-col gap-4 text-sm font-medium">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <button
                    onClick={() => handleLinkClick(href)}
                    className="w-full text-left px-2 py-1 hover:underline hover:text-accent"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            {!isLoggedIn && (
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLinkClick("/sign-in")}
                >
                  Login
                </Button>
                <Button size="sm" onClick={() => handleLinkClick("/sign-in")}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )
      }
    </header >
  );
};

export default Header;
