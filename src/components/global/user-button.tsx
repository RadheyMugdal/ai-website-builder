import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const UserButton = () => {
  const session = authClient.useSession();
  const router = useRouter();
  if (!session || !session.data?.user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={session?.data.user.image!} />
          <AvatarFallback className="bg-secondary">
            {session.data.user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className=" min-w-[230px]">
        <DropdownMenuLabel>Profile</DropdownMenuLabel>
        {/* <DropdownMenuSeparator /> */}

        <div className=" py-2">
          <div className=" flex gap-2 items-center">
            <Avatar>
              <AvatarImage src={session?.data.user.image!} />
              <AvatarFallback className="bg-secondary">
                {session.data.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center text-sm ">
              <p className="font-semibold truncate">{session.data.user.name}</p>
              <p className="truncate opacity-75"> {session.data.user.email}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            authClient.signOut();
            router.push("/sign-in");
          }}
          className=" py-3 items-center"
        >
          <LogOut className=" size-5" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
