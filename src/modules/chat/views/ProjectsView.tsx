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
import {
  useInfiniteQuery,
  useQuery,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { Ellipsis, SquareArrowOutUpRight, Trash2, Waves } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useProjectsFilter } from "../hooks/use-projects-filter";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/global/loader";
import { Spinner } from "@/components/global/spinner";

const ProjectsView = () => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteProjectId, setDeleteProjectId] = React.useState("");
  const trpc = useTRPC();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useSuspenseInfiniteQuery(
      trpc.project.getUserProjects.infiniteQueryOptions(
        {
          cursor: undefined,
          limit: DEFAULT_PAGE_SIZE,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      )
    );

  return (
    <div className=" mx-8 md:mx-12 lg:mx-24 rounded-2xl bg-secondary flex flex-col gap-4 min-h-[30vh] p-8">
      <h4 className=" font-semibold text-2xl">Recent Projects</h4>
      <div className="grid  grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {data?.pages.map((page) =>
          page.projects.map((project) => (
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
                      <Trash2 /> Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
      {
        isFetchingNextPage && (
          <span className="flex gap-1 items-center justify-center w-full">
            <Spinner className=" size-6" />
            Loading more projects
          </span>

        )
      }
      {isError || data?.pages?.every((page) => page.projects.length === 0) && <p className="opacity-75 m-auto">No projects found</p>}
      {
        data?.pages?.every((page) => page.projects.length > 0) && (
          <div className="mx-auto">
            <Button
              className=""
              disabled={!hasNextPage || isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              Load more
            </Button>
          </div>
        )
      }

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
