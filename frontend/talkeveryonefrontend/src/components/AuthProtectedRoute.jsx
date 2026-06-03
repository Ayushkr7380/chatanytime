import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/hooks/useMe";

function AuthProtectedRoute() {

    const { data, isLoading } = useMe();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (data?.user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default AuthProtectedRoute;