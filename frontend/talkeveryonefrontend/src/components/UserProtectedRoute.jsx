import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/hooks/useMe";
import Skeleton from "./Skeleton";

function UserProtectedRoute() {

    const { data, isLoading, isError } = useMe();

    if (isLoading) {
        return (
            <div className="flex h-dvh bg-slate-50">

                {/* Sidebar skeleton */}
                <div className="w-full md:w-[35%] lg:w-[30%] bg-white border-r border-slate-200 flex flex-col h-full">
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
                    <div className="p-4 space-y-4 flex-1">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <Skeleton className="h-4 w-28 mb-2" />
                                    <Skeleton className="h-3 w-44" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat area skeleton — desktop only */}
                <div className="hidden md:flex flex-1 flex-col bg-slate-50">
                    <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
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
        );
    }

    if (isError || !data?.user) {
        return <Navigate to="/authentication" replace />;
    }

    return <Outlet />;
}

export default UserProtectedRoute;