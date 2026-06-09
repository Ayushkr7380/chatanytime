import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useMe } from "@/hooks/useMe";
import { useUpdatePrivacy } from "@/hooks/useUpdatePrivacy";
import Skeleton from "@/components/Skeleton";
import { useState } from "react";

const Toggle = ({ value, onChange, disabled }) => (
    <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`
            w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0
            ${value ? "bg-violet-600" : "bg-slate-200"}
            ${disabled ? "opacity-50" : ""}
        `}
    >
        <div className={`
            absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200
            ${value ? "left-[22px]" : "left-0.5"}
        `} />
    </button>
);

export default function PrivacyPage() {

    const [updatingKey, setUpdatingKey] = useState(null);
    const navigate = useNavigate();
    const { data: meData, isLoading } = useMe();
    const user = meData?.user;
    const { mutate: updatePrivacy } = useUpdatePrivacy();

    const handleToggle = (field, value) => {
        setUpdatingKey(field);
        updatePrivacy(
            { [field]: value },
            {
                onSuccess: () => setUpdatingKey(null),
                onError: () => setUpdatingKey(null)
            }
        );
    };

    const fields = [
        {
            key: "lastSeen",
            label: "Last seen",
            desc: "Show when you were last active",
        },
        {
            key: "profilePic",
            label: "Profile photo",
            desc: "Show your profile picture",
        },
        {
            key: "bio",
            label: "Bio",
            desc: "Show your bio to others",
        },
        {
            key: "onlineStatus",
            label: "Online status",
            desc: "Show when you are online",
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
                <h2 className="font-semibold text-slate-800 text-sm px-2">Privacy</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {isLoading ? (
                    <div className="bg-white mt-2 border-y border-slate-200 p-4 space-y-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-4 w-28 mb-1" />
                                    <Skeleton className="h-3 w-44" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white mt-2 border-y border-slate-200">
                        {fields.map(({ key, label, desc }) => (
                            <div
                                key={key}
                                className="flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-b-0"
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm text-slate-800 font-medium">{label}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                                </div>
                                <Toggle
                                    value={user?.privacy?.[key] ?? true}
                                    onChange={(val) => handleToggle(key, val)}
                                    disabled={updatingKey === key}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}