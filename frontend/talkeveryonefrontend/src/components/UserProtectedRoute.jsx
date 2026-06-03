import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/hooks/useMe";

function UserProtectedRoute() {

    const { data, isLoading, isError } = useMe();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError || !data?.user) {
        return <Navigate to="/authentication" replace />;
    }

    return <Outlet />;
}

export default UserProtectedRoute;