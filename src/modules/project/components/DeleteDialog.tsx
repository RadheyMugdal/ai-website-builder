"use client";
import { Spinner } from "@/components/global/spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DEFAULT_PAGE_SIZE } from "@/modules/chat/constants";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
interface Props {
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
  setDeleteProjectId: React.Dispatch<React.SetStateAction<string>>;
}

const DeleteDialog = ({
  open,
  setIsOpen,
  projectId,
  setDeleteProjectId,
}: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deleteProject = useMutation(trpc.project.deleteById.mutationOptions());

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogTitle>Delete Project</DialogTitle>
        <p>Are you sure you want to delete this project?</p>
        <div className="flex gap-4 mt-4">
          <Button
            variant={"outline"}
            onClick={() => setIsOpen(false)}
            disabled={deleteProject.isPending}
          >
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={async () => {
              try {
                await deleteProject.mutateAsync({ id: projectId });

                queryClient.setQueryData(
                  trpc.project.getUserProjects.infiniteQueryKey({
                    cursor: undefined,
                    limit: DEFAULT_PAGE_SIZE,
                  }),
                  (oldData: any) => {
                    if (!oldData) return oldData;
                    return {
                      ...oldData,
                      pages: oldData.pages.map((page: any) => ({
                        ...page,
                        projects: page.projects.filter((p: any) => p.id !== projectId),
                      })),
                    };
                  }
                );  

                toast.success("Project deleted successfully");
                setIsOpen(false);
                setDeleteProjectId("");
              } catch (err: any) {
                toast.error(err.message || "Something went wrong");
                setIsOpen(false);
              }
            }}

            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending && <Spinner />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
