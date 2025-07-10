"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hamburger, Menu } from "lucide-react";
import Link from "next/link";
import React from "react";

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <header className=" py-2 px-8 relative ">
      <div className="flex  justify-between">
        <div className="flex gap-12 items-center">
          <h1 className="text-xl font-bold">❤️Lovable</h1>
          <nav className=" hidden md:block">
            <ul className="flex gap-4">
              <li>
                <Link href={"/"} className=" hover:underline hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={"/pricing"}
                  className=" hover:underline hover:text-accent"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href={"/about"}
                  className=" hover:underline hover:text-accent"
                >
                  About us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div
          className={cn(
            " absolute inset-x-0 top-full bg-background    border-b py-4  md:hidden",
            isOpen ? "absolute" : "hidden"
          )}
        >
          <div className="flex  flex-col gap-8 px-8 ">
            <ul className="flex flex-col items-center gap-4">
              <li>
                <Link href={"/"} className=" hover:underline hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={"/pricing"}
                  className=" hover:underline hover:text-accent"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href={"/about"}
                  className=" hover:underline hover:text-accent"
                >
                  About us
                </Link>
              </li>
            </ul>
            <div className="flex flex-col gap-3  ">
              <Button variant={"secondary"} size={"sm"}>
                Login
              </Button>
              <Button size={"sm"}>Get started</Button>
            </div>
          </div>
        </div>
        <div className=" gap-3 hidden md:flex">
          <Button variant={"secondary"} size={"sm"}>
            Login
          </Button>
          <Button size={"sm"}>Get started</Button>
        </div>
        <button
          type="button"
          className=" md:hidden hover:bg-secondary p-1 rounded-md"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Menu />
        </button>
      </div>
    </header>
  );
};

export default Header;
