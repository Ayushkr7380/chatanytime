import Messages from "./Messages";
import CreateGroup from "./CreateGroup";
import { useMe } from "@/hooks/useMe";
import { Outlet } from "react-router-dom";
import { SearchUser } from "./SearchUser";
import { useContext, useEffect } from "react";
import { CreateSocketContext } from "@/context/socketContext/CreateSocketContext";
import Skeleton from "@/components/Skeleton";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../websocket/Socket";
import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";

function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const { connectSocket } = useContext(CreateSocketContext);
    const { data, isLoading } = useMe();

    useEffect(() => {
        if (data?.user && !socket.connected) {
            connectSocket({
                userId: data.user._id,
                name: data.user.name,
            });
        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="h-[100dvh] bg-slate-50">
                <div className="flex h-full">
                    <div className="w-full md:w-[35%] lg:w-[30%] bg-white border-r border-slate-200 flex flex-col h-[100dvh]">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
                            <div>
                                <Skeleton className="h-6 w-28 mb-2" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </div>
                        <div className="p-4 space-y-4 flex-1" style={{ overflowY: "auto" }}>
                            {[...Array(10)].map((_, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <Skeleton className="h-4 w-28 mb-2" />
                                        <Skeleton className="h-3 w-44" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:flex flex-1 flex-col bg-slate-50">
                        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="flex-1 p-5 space-y-4" style={{ overflowY: "auto" }}>
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
        location.pathname.startsWith("/group/") ||
        location.pathname.startsWith("/new-chat/");

    const isProfilePage = location.pathname.startsWith("/profile");

    return (
        <div
            className="flex bg-slate-50 overflow-hidden"
            style={{ height: "var(--app-height)" }}
        >
            {/* Sidebar */}
            <aside
                className={`
                    ${isChatPage || isProfilePage ? "hidden md:flex" : "flex"}
                    w-full
                    md:w-[35%]
                    lg:w-[30%]
                    bg-white
                    border-r
                    border-slate-200
                    flex-col
                    h-full
                `}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-violet-600">
                            Messages
                        </h1>
                        <p className="text-xs text-slate-500">
                            Stay connected
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <SearchUser />
                        <CreateGroup />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <Messages />
                </div>

                {/* Footer — profile navigate */}
                <div className="border-t border-slate-200 p-3 bg-white shrink-0">
                    <button
                        onClick={() => navigate("/profile")}
                        className={`
                            w-full flex items-center gap-3 p-2 rounded-2xl
                            transition-colors duration-150
                            ${isProfilePage
                                ? "bg-violet-100"
                                : "hover:bg-violet-50 active:bg-violet-100"
                            }
                        `}
                    >
                        <img
                            src={data?.user?.profilePic || dummyprofilepic}
                            alt="profile"
                            className="h-10 w-10 rounded-full object-cover border-2 border-violet-200 shrink-0"
                        />
                        <div className="flex-1 text-left min-w-0">
                            <h3 className="font-semibold text-slate-800 text-sm truncate">
                                {data?.user?.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">
                                {data?.user?.email}
                            </p>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <main
                className={`
                    ${isChatPage || isProfilePage ? "flex" : "hidden md:flex"}
                    flex-1
                    bg-slate-50
                    h-full
                    min-h-0
                `}
            >
                <Outlet />
            </main>
        </div>
    );
}

export default Home;