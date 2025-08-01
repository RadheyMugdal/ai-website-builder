import Link from "next/link";
import React from "react";
import { LuWaves } from "react-icons/lu";

const Logo = () => {
  return (
    <Link href={"/"}>
      <div className="flex gap-1 justify-center items-center">
        <span>
          <LuWaves className=" size-6 text-primary" />
        </span>
        <h1 className=" font-bold  text-lg">Wavely</h1>
      </div>
    </Link>
  );
};

export default Logo;
