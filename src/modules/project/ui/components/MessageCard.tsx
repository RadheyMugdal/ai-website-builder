import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "../../schema";
import { format } from "date-fns";

const MessageCard = ({ message }: { message: Message }) => {
  return (
    <div className="   flex gap-1 w-full    justify-end">
      <div className="bg-input mt-2.5 p-4 max-w-[80%]  text-sm  rounded-lg">
        {message.content}
      </div>
    </div>
  );
};

const AssistantMessageCard = ({ message }: { message: Message }) => {
  return (
    <div className="   flex gap-1 w-full max-w-[80%]  group   justify-start">
      <div className="flex  w-full gap-1">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            W
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5  w-full">
          <div className="flex gap-1.5 items-baseline ">
            <span className=" font-semibold  text-sm">Wavely</span>
            <span className=" text-xs hidden group-hover:inline-block   opacity-60 ">
              {format(message.createdAt, "HH:mm:ss")}
            </span>
          </div>
          <div className="  p-4 bg-secondary  text-sm  rounded-xl rounded-tl-none">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export { MessageCard, AssistantMessageCard };
