import React from "react";
import { Spinner } from "./spinner";

const Loader = () => {
  return (
    <div className=" w-full  min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
};

export default Loader;
