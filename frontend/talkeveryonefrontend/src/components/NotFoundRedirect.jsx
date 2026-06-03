import { Navigate } from "react-router-dom";
import { useMe } from "@/hooks/useMe";

function NotFoundRedirect() {

    const { data, isLoading } = useMe();

    if (isLoading) {
        return null;
    }

    return (
        <Navigate
            to={data?.user ? "/" : "/authentication"}
            replace
        />
    );
}

export default NotFoundRedirect;