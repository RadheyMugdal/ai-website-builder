import { create } from "zustand";

interface LoginDialogStore {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  close: () => void;
  open: () => void;
}

export const useLoginDialogStore = create<LoginDialogStore>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: false }),
}));
