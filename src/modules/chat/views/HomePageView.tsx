import React from "react";
import ChatView from "./ChatView";
import ProjectsView from "./ProjectsView";

interface props {
  isLoggedIn: boolean;
}

const HomePageView = ({ isLoggedIn }: props) => {
  return (
    <div>
      <div className="flex min-h-[80vh]  flex-col items-center px-4  flex-1  justify-center gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-center text-3xl text-pretty md:text-4xl lg:text-5xl font-semibold">
            Convert your ideas into reality
          </h1>
          <p className=" text-center text-sm">
            Create website in minutes with our AI website builder.
          </p>
        </div>
        <ChatView />
      </div>
      {isLoggedIn && <ProjectsView />}
    </div>
  );
};

export default HomePageView;
