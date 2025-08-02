import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { authClient } from "@/lib/auth-client";
import { Gem, LogOut, Sparkles, Wallet } from "lucide-react";
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
        <div className=" py-2">
          <div className=" flex gap-2 items-center">
            <Avatar>
              <AvatarImage src={session?.data.user.image!} />
              <AvatarFallback>
                {session.data.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center text-sm ">
              <p className="font-semibold truncate text-sm">{session.data.user.name}</p>
              <p className="truncate opacity-75 text-xs"> {session.data.user.email}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          router.push("/pricing")
        }}>
          <Sparkles />
          Upgrade to Pro
        </DropdownMenuItem>

        <DropdownMenuItem onClick={async () => {
          await authClient.customer.portal()
        }}>
          <Wallet />
          Biling
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            authClient.signOut();
            router.push("/sign-in");
          }}

        >
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
