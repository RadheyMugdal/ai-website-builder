import Link from "next/link";
import React from "react";
import { LuWaves } from "react-icons/lu";

const Logo = () => {
  return (
    <Link href={"/"}>
      <div className="flex gap-2 justify-center items-center">
        <span>
          <LuWaves className=" size-6 text-primary" />
        </span>
        <h1 className=" font-bold  text-2xl">Wavely</h1>
      </div>
    </Link>
  );
};

export default Logo;
