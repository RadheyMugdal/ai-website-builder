import { auth } from "@/lib/auth";
import Header from "@/modules/chat/ui/components/header";
import { headers } from "next/headers";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <div className="flex flex-col min-h-screen max-w-7xl  mx-auto">
      <Header isLoggedIn={!!session} />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};

export default layout;
