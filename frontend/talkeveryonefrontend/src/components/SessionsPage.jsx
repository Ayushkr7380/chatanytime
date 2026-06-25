import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Monitor, Smartphone, Tablet, Loader2 } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useLogoutSession } from "@/hooks/useLogoutSession";
import { useLogoutAll } from "@/hooks/useLogoutAll";
import { useMe } from "@/hooks/useMe";

// Function to return React Icon component dynamically
const getDeviceIcon = (type) => {
    if (type === "mobile") return <Smartphone className="w-6 h-6 text-slate-600" />;
    if (type === "tablet") return <Tablet className="w-6 h-6 text-slate-600" />;
    return <Monitor className="w-6 h-6 text-slate-600" />;
};

export default function SessionsPage() {
    const navigate = useNavigate();
    const { data: meData } = useMe();
    const currentSessionId = meData?.sessionId;

    const { data, isLoading } = useSessions();

    console.log("session data : check 1 : ", data);
    const sessions = data?.sessions || [];
    console.log("session data : check 2 : ", sessions);

    const { mutate: logoutOne, isPending: isLoggingOne } = useLogoutSession();
    const { mutate: logoutAll, isPending: isLoggingAll } = useLogoutAll();

    const current = sessions.find(s => s._id === currentSessionId);
    const others = sessions.filter(s => s._id !== currentSessionId);

    return (
        <div className="w-full flex flex-col bg-slate-50" style={{ height: "var(--app-height)" }}>

            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <button onClick={() => navigate("/profile")} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <IoArrowBack size={20} className="text-slate-700" />
                </button>
                <h2 className="font-semibold text-slate-800 text-sm px-2">Active Sessions</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">

                {/* Info banner */}
                <div className="mx-4 mt-4 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                    <p className="text-xs text-violet-700">If you see an unfamiliar device, log it out and change your password immediately.</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center mt-20 gap-2">
                        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                        <p className="text-sm text-slate-400">Loading sessions...</p>
                    </div>
                ) : (
                    <>
                        {/* Current device */}
                        {current && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-400 uppercase tracking-wide px-5 mb-2">Current device</p>
                                <div className="bg-white border-y border-slate-200 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            {getDeviceIcon(current.deviceInfo?.device)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800">
                                                {current.deviceInfo?.browser} · {current.deviceInfo?.os}
                                            </p>
                                            <p className="text-xs text-slate-400">{current.ipAddress} · {current.location}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                <p className="text-xs text-green-600">Active now</p>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-violet-100 text-violet-700 rounded-full px-2 py-0.5 font-medium">This device</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other devices */}
                        {others.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-400 uppercase tracking-wide px-5 mb-2">Other devices</p>
                                <div className="bg-white border-y border-slate-200 divide-y divide-slate-100">
                                    {others.map(session => (
                                        <div key={session._id} className="flex items-center gap-3 px-5 py-4">
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                {getDeviceIcon(session.deviceInfo?.device)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {session.deviceInfo?.browser} · {session.deviceInfo?.os}
                                                </p>
                                                <p className="text-xs text-slate-400">{session.ipAddress} · {session.location}</p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(session.lastActive).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => logoutOne(session._id)}
                                                disabled={isLoggingOne}
                                                className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
                                            >
                                                {isLoggingOne ? "Logging out..." : "Log out"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Logout all */}
                        <div className="px-4 py-4">
                            <button
                                onClick={() => logoutAll()}
                                disabled={isLoggingAll}
                                className="w-full py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoggingAll && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isLoggingAll ? "Logging out..." : "Log out all devices"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}