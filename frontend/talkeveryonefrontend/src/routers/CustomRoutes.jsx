import { Routes, Route } from "react-router-dom";

import Home from "@/components/Home";
import Chat from "@/components/Chat";
import ToggleAuth from "@/components/ToggleAuth";

import UserProtectedRoute from "../components/UserProtectedRoute";
import AuthProtectedRoute from "../components/AuthProtectedRoute";
import EmptyChat from "@/components/EmptyChat";
import NotFoundRedirect from "@/components/NotFoundRedirect";

function CustomRoutes() {
    return (
        <Routes>

            {/* Auth Routes */}
            <Route element={<AuthProtectedRoute />}>
                <Route
                    path="/authentication"
                    element={<ToggleAuth />}
                />
            </Route>

            {/* Protected Routes */}
            <Route element={<UserProtectedRoute />}>

                <Route
                    path="/"
                    element={<Home />}
                >

                    <Route
                        index
                        element={<EmptyChat />}
                    />

                    <Route
                        path="chat/:chatId"
                        element={<Chat />}
                    />

                </Route>

            </Route>

            {/* Catch All */}
            <Route
                path="*"
                element={<NotFoundRedirect />}
            />
        </Routes>
    );
}

export default CustomRoutes;