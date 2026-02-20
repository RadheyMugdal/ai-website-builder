"use client";

import { Suspense } from "react";
import ChatView from "./ChatView";
import ProjectsViewSkeleton from "../components/ProjectViewSkeleton";
import ProjectsView from "./ProjectsView";
import { motion } from "motion/react";

interface props {
  isLoggedIn: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const HomePageView = ({ isLoggedIn }: props) => {
  return (
    <div>
      <motion.div
        className="flex min-h-[80vh] flex-col items-center px-4 flex-1 justify-center gap-6 sm:gap-8 md:gap-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex flex-col gap-3 sm:gap-4 max-w-4xl w-full"
          variants={containerVariants}
        >
          <motion.h1
            className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-pretty font-medium leading-tight"
            variants={itemVariants}
          >
            Transform Ideas Into Reality
          </motion.h1>
          <motion.p
            className="text-center text-sm sm:text-base md:text-lg  font-light px-2 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Create website in minutes with our AI website builder.
          </motion.p>
        </motion.div>
        <motion.div variants={itemVariants} className=" w-full">
          <ChatView />
        </motion.div>
      </motion.div>
      {isLoggedIn &&
        <Suspense fallback={<ProjectsViewSkeleton />}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <ProjectsView />
          </motion.div>
        </Suspense>
      }
    </div>
  );
};

export default HomePageView;
