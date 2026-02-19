import { Suspense } from "react";
import ChatView from "./ChatView";
import ProjectsViewSkeleton from "../components/ProjectViewSkeleton";
import ProjectsView from "./ProjectsView";
import { Parisienne } from "next/font/google";
import { cn } from "@/lib/utils";


const pacifico=Parisienne({
weight:['400'],

})

interface props {
  isLoggedIn: boolean;
}

const HomePageView = ({ isLoggedIn }: props) => {
  return (
    <div>
      <div className="flex min-h-[80vh] flex-col items-center px-4 flex-1 justify-center gap-6 sm:gap-8 md:gap-10">
        <div className="flex flex-col gap-3 sm:gap-4 max-w-4xl w-full">
          <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-pretty font-medium leading-tight">
            Transform Ideas Into Reality
          </h1>
          <p className="text-center text-sm sm:text-base md:text-lg  font-light px-2 max-w-2xl mx-auto">
            Create website in minutes with our AI website builder.
          </p>
        </div>
        <ChatView />
      </div>
      {isLoggedIn &&
        <Suspense fallback={<ProjectsViewSkeleton />}>
          <ProjectsView />
        </Suspense>
      }
    </div>
  );
};

export default HomePageView;
