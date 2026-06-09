import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useMe } from "@/hooks/useMe";
import Skeleton from "@/components/Skeleton";

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`;
    return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) +
        ", " + date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
};

export default function MyInfoPage() {
    const navigate = useNavigate();
    const { data: meData, isLoading } = useMe();
    const user = meData?.user;

    const fields = [
        {
            label: "Name",
            value: user?.name,
            updatedAt: user?.nameUpdatedAt,
        },
        {
            label: "Username",
            value: user?.username ? `@${user.username}` : null,
            updatedAt: user?.usernameUpdatedAt,
        },
        {
            label: "Bio",
            value: user?.bio || null,
            updatedAt: user?.bioUpdatedAt,
            placeholder: "Not set"
        },
        {
            label: "Email",
            value: user?.email,
        },
        {
            label: "Joined",
            value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString([], {
                    day: "numeric", month: "long", year: "numeric"
                })
                : null,
        },
    ];

    return (
        <div
            className="w-full flex flex-col bg-slate-50"
            style={{ height: "var(--app-height)" }}
        >
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center px-3 shrink-0">
                <button
                    onClick={() => navigate("/profile")}
                    className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
                >
                    <IoArrowBack size={20} className="text-slate-700" />
                </button>
                <h2 className="font-semibold text-slate-800 text-sm px-2">My info</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 space-y-4 bg-white mt-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-3 w-16 mb-2" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white mt-2 border-y border-slate-200">
                        {fields.map(({ label, value, updatedAt, placeholder }) => (
                            <div
                                key={label}
                                className="px-5 py-3 border-b border-slate-100 last:border-b-0"
                            >
                                <p className="text-xs text-slate-400 mb-1">{label}</p>
                                <p className={`text-sm ${value ? "text-slate-800" : "text-slate-400 italic"}`}>
                                    {value || placeholder || "—"}
                                </p>
                                {updatedAt && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Last updated: {formatDate(updatedAt)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}