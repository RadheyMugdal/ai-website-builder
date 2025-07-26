"use client";
import { Spinner } from "@/components/global/spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
              await deleteProject.mutateAsync({ id: projectId });
              queryClient.invalidateQueries(
                trpc.project.getUserProjects.queryOptions()
              );
              if (deleteProject.isError) {
                setIsOpen(false);
                toast.error(deleteProject.error.message);
              }
              setIsOpen(false);
              toast.success("Project deleted successfully");
              setDeleteProjectId("");
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
