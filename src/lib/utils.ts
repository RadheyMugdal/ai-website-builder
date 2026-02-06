import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


import { addMilliseconds, format } from 'date-fns';

export function formatMsAsFutureDate(ms: number) {
  const futureDate = addMilliseconds(new Date(), ms || 0);
  // Format like "12 Jan, 2026"
  return format(futureDate, 'dd MMM, yyyy');
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export type PreviewDevice = {
  name: string;
  width: string;
};

export const previewDevices: PreviewDevice[] = [
  {
    name: "Desktop",
    width: "100%",
  },
  {
    name: "Tablet",
    width: "60%",
  },
  {
    name: "Mobile",
    width: "40%",
  },
];
