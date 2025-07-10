import LoginDialog from "@/modules/auth/components/ui/login-dialog";
import Header from "@/modules/chat/components/ui/header";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
      <LoginDialog />
    </>
  );
};

export default layout;
