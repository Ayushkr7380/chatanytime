import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useSessions } from "@/hooks/useSessions";
import { useLogoutSession } from "@/hooks/useLogoutSession";
import { useLogoutAll } from "@/hooks/useLogoutAll";
import { useMe } from "@/hooks/useMe";

const deviceIcon = (type) => {
    if (type === "mobile") return "📱";
    if (type === "tablet") return "📲";
    return "💻";
};

export default function SessionsPage() {
    const navigate = useNavigate();
    const { data: meData } = useMe();
   const currentSessionId = meData?.sessionId;

    const { data, isLoading } = useSessions();

    console.log("session data : check 1 : ",data);
    const sessions = data?.sessions || [];
    console.log("session data : check 2 : ",sessions);

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
                    <p className="text-center text-sm text-slate-400 mt-10">Loading sessions...</p>
                ) : (
                    <>
                        {/* Current device */}
                        {current && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-400 uppercase tracking-wide px-5 mb-2">Current device</p>
                                <div className="bg-white border-y border-slate-200 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{deviceIcon(current.deviceInfo?.device)}</span>
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
                                        <span className="text-xs bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">This device</span>
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
                                            <span className="text-2xl">{deviceIcon(session.deviceInfo?.device)}</span>
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
                                                className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                Log out
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
                                className="w-full py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                {isLoggingAll ? "Logging out..." : "Log out all devices"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}