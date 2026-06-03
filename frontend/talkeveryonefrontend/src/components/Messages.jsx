import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Link, useParams } from "react-router-dom";
import { useChats } from "@/hooks/useChats";
import { useMe } from "@/hooks/useMe";
import Skeleton from "@/components/Skeleton";

export default function Messages() {

    const { chatId } = useParams();

    const { data: meData } = useMe();

    const {
        data: chats,
        isLoading,
        isError,
    } = useChats();

    if (isLoading) {
        return (
            <div className="p-3 space-y-3">
                {[...Array(10)].map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3"
                    >
                        <Skeleton className="h-12 w-12 rounded-full" />

                        <div className="flex-1">
                            <Skeleton className="h-4 w-28 mb-2" />
                            <Skeleton className="h-3 w-44" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                Failed to load chats
            </div>
        );
    }

    if (!chats?.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <h3 className="font-semibold text-slate-700">
                    No conversations yet
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                    Start a new chat by clicking the + button
                </p>
            </div>
        );
    }

    return (
        <div className="p-2">

            <ItemGroup className="gap-1">

                {chats.map((chat) => {

                    const otherUser = chat.users.find(
                        (u) => u._id !== meData?.user?._id
                    );

                    const isActive = chatId === chat._id;

                    return (
                        <Item
                            key={chat._id}
                            variant="outline"
                            asChild
                            role="listitem"
                            className={`
                                border-0
                                rounded-2xl
                                transition-all
                                duration-200
                                px-2
                                py-1
                                ${
                                    isActive
                                        ? "bg-violet-100"
                                        : "hover:bg-violet-50"
                                }
                            `}
                        >
                            <Link
                                to={`/chat/${chat._id}`}
                                className="flex items-center gap-3"
                            >

                                <ItemMedia variant="image">
                                    <img
                                        src={dummyprofilepic}
                                        alt={otherUser?.name}
                                        width={48}
                                        height={48}
                                        className="
                                            h-12
                                            w-12
                                            rounded-full
                                            object-cover
                                            border-2
                                            border-violet-200
                                        "
                                    />
                                </ItemMedia>

                                <ItemContent className="flex-1 min-w-0">

                                    <div className="flex items-center justify-between">

                                        <ItemTitle
                                            className="
                                                text-slate-800
                                                font-semibold
                                                truncate
                                            "
                                        >
                                            {otherUser?.name}
                                        </ItemTitle>

                                        <ItemDescription
                                            className="
                                                text-xs
                                                text-slate-400
                                                ml-2
                                                shrink-0
                                            "
                                        >
                                            {new Date(
                                                chat.updatedAt
                                            ).toLocaleTimeString([], {
                                                hour12: true,
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </ItemDescription>

                                    </div>

                                    <ItemDescription
                                        className="
                                            text-sm
                                            text-slate-500
                                            truncate
                                            mt-1
                                        "
                                    >
                                        {
                                            chat.latestMessage?.content ||
                                            "Start chatting..."
                                        }
                                    </ItemDescription>

                                </ItemContent>

                            </Link>
                        </Item>
                    );
                })}

            </ItemGroup>

        </div>
    );
}