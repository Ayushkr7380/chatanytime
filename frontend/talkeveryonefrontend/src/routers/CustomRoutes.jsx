import { Routes, Route } from "react-router-dom";

import Home from "@/components/Home";
import Chat from "@/components/Chat";
import ToggleAuth from "@/components/ToggleAuth";

import UserProtectedRoute from "../components/UserProtectedRoute";
import AuthProtectedRoute from "../components/AuthProtectedRoute";
import EmptyChat from "@/components/EmptyChat";
import NotFoundRedirect from "@/components/NotFoundRedirect";
import GroupChat from "@/components/GroupChat"
import GroupInfo from "@/components/GroupInfo";
import UserInfo from "@/components/UserInfo";
import NewChat from "@/components/NewChat";
import ProfilePage from "@/components/ProfilePage";
import BlockedUsersPage from "@/components/BlockedUsersPage";
import MyInfoPage from "@/components/MyInfoPage";
import PrivacyPage from "@/components/PrivacyPage";
import SessionsPage from "@/components/SessionsPage";

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

                    <Route path="group/:chatId" element={<GroupChat />} />
                    <Route
                        path="group/:chatId/info"
                        element={<GroupInfo />}
                    />

                    <Route
                        path="chat/:chatId/info"
                        element={<UserInfo />}
                    />

                    <Route path="new-chat/:userId" element={<NewChat />} />
                    <Route path="profile" element={<ProfilePage />} />

                    <Route path="profile/blocked" element={<BlockedUsersPage />} />
                    <Route path="profile/info" element={<MyInfoPage />} />
                    <Route path="profile/privacy" element={<PrivacyPage />} />
                    <Route path="/profile/sessions" element={<SessionsPage />} />

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