import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import React from "react";

const LoadingState = () => {
  return (
    <div className="   flex gap-1 w-full  group   justify-start">
      <div className="flex  w-full gap-1">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            W
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5  w-full">
          <div className="flex gap-1.5 items-baseline">
            <span className=" font-semibold  text-xs">Wavely</span>

            <div className="flex gap-1 items-center">
              <Loader2 className="size-3 align-text-bottom opacity-50  animate-spin " />
              <span className="text-xs  ">Generating application</span>
            </div>
          </div>
          <Skeleton className="max-w-[80%]   rounded-xl rounded-tl-none w-full h-16 bg-secondary" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
