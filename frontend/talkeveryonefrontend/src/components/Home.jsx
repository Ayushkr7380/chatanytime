import Messages from "./Messages";
import CreateGroup from "./CreateGroup";
import { useMe } from "@/hooks/useMe";
import { Outlet } from "react-router-dom";
import { SearchUser } from "./SearchUser";
import { useContext, useEffect } from "react";
import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";
import Skeleton from "@/components/Skeleton";
import { useLocation } from "react-router-dom";
import ProfileSheet from "./ProfileSheet";

function Home() {
    const location = useLocation();
    const { connectSocket } = useContext(CreateSocketContext);

    const { data, isLoading } = useMe();

    useEffect(() => {
        if (data?.user) {
            connectSocket({
                userId: data.user._id,
                name: data.user.name,
            });
        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-50">
                <div className="flex h-full">

                    {/* Sidebar Skeleton */}
                    <div className="w-full md:w-[35%] lg:w-[30%] bg-white border-r border-slate-200">

                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div>
                                <Skeleton className="h-6 w-28 mb-2" />
                                <Skeleton className="h-3 w-40" />
                            </div>

                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
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

                    </div>

                    {/* Chat Skeleton */}
                    <div className="hidden md:flex flex-1 flex-col bg-slate-50">

                        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-40" />
                        </div>

                        <div className="flex-1 p-5 space-y-4">
                            <Skeleton className="h-12 w-48 rounded-2xl" />
                            <Skeleton className="h-12 w-72 rounded-2xl ml-auto" />
                            <Skeleton className="h-12 w-40 rounded-2xl" />
                            <Skeleton className="h-12 w-64 rounded-2xl ml-auto" />
                        </div>

                    </div>

                </div>
            </div>
        );
    }


    const isChatPage =
    location.pathname.startsWith("/chat/") ||
    location.pathname.startsWith("/group/");

    return (
        <div className="flex h-screen bg-slate-50">

            {/* Sidebar */}
            <aside
                className={`
                    ${
                    isChatPage
                        ? "hidden md:flex"
                        : "flex"
                    }
                    w-full
                    md:w-[35%]
                    lg:w-[30%]
                    bg-white
                    border-r
                    border-slate-200
                    flex-col
                `}
                >

                {/* Header */}
                <div
                    className="
                        px-5
                        py-4
                        border-b
                        border-slate-200
                        flex
                        items-center
                        justify-between
                    "
                >
                    <div>
                        <h1
                            className="
                                text-2xl
                                font-bold
                                text-violet-600
                            "
                        >
                            Messages
                        </h1>

                        <p
                            className="
                                text-xs
                                text-slate-500
                            "
                        >
                            Stay connected
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <SearchUser />
                        <CreateGroup />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    <Messages />
                </div>

                {/* User Card */}
                <div
                    className="
                        border-t
                        border-slate-200
                        p-3
                        bg-white
                    "
                >
                    <ProfileSheet
                        user={data?.user}
                    />
                </div>

            </aside>

            {/* Chat Area */}
            <main
                className={`
                    ${
                    isChatPage
                        ? "flex"
                        : "hidden md:flex"
                    }
                    flex-1
                    bg-slate-50
                `}
            >
                <Outlet />
            </main>

        </div>
    );
}

export default Home;