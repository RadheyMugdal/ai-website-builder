"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteDialog from "@/modules/project/components/DeleteDialog";
import { useTRPC } from "@/trpc/client";
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dot,
  Ellipsis,
  SquareArrowOutUpRight,
  Trash2,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const ProjectsView = () => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteProjectId, setDeleteProjectId] = React.useState("");
  const trpc = useTRPC();
  const { data, isLoading, isError } = useSuspenseQuery(
    trpc.project.getUserProjects.queryOptions()
  );

  return (
    <div className=" mx-8 md:mx-12 lg:mx-24 rounded-2xl bg-secondary flex flex-col gap-4 min-h-[30vh] p-8">
      <h4 className=" font-semibold text-2xl">Recent Projects</h4>
      <div className="grid  grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {data &&
          data.map((project) => (
            <Card
              key={project.id}
              onClick={() => router.push(`/project/${project.id}`)}
              className="cursor-pointer"
            >
              <CardHeader className="relative">
                <CardTitle>
                  <Waves className=" text-primary my-2 size-8" />
                  {project.name}
                </CardTitle>
                <CardDescription>
                  {format(new Date(project.createdAt), "PP p")}
                </CardDescription>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className=" absolute right-4 bottom-0"
                    asChild
                  >
                    <button className="">
                      <Ellipsis />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <SquareArrowOutUpRight
                        onClick={() => router.push(`/project/${project.id}`)}
                      />
                      Open Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteProjectId(project.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      {" "}
                      <Trash2 /> Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
            </Card>
          ))}
      </div>
      {isError && <p className="opacity-75 m-auto">No projects found</p>}
      <DeleteDialog
        open={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        projectId={deleteProjectId}
        setDeleteProjectId={setDeleteProjectId}
      />
    </div>
  );
};

export default ProjectsView;
