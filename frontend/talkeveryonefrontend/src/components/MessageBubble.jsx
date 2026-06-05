import { BsCheckAll } from "react-icons/bs";

export const MessageBubble = ({
    text,
    isSender,
    time,
    isRead,
    senderName,
    messageType = "user",
}) => {

    // System Message
    if (messageType === "system") {
        return (
            <div className="flex justify-center my-3">
                <p
                    className="
                    text-[11px]
                    text-slate-500
                    text-center
                    max-w-[80%]
                "
                >
                    {text}
                </p>
            </div>
        );
    }

    return (
        <div
            className={`flex ${isSender
                    ? "justify-end"
                    : "justify-start"
                } my-2`}
        >
            <div
                className={`
                    max-w-[70%]
                    px-3
                    py-2
                    rounded-2xl
                    text-sm
                    flex
                    flex-col
                    gap-1
                    ${isSender
                        ? "bg-violet-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 rounded-bl-none shadow-sm"
                    }
                `}
            >

                {/* Group Sender Name */}
                {senderName && (
                    <p className="text-xs font-semibold text-violet-500">
                        {senderName}
                    </p>
                )}

                <p className="break-words">
                    {text}
                </p>

                <div className="flex items-center justify-end gap-1">

                    <p className="text-[10px] opacity-60">
                        {time}
                    </p>

                    {isSender && (
                        isRead ? (
                            <BsCheckAll className="text-[14px] text-blue-300" />
                        ) : (
                            <BsCheckAll className="text-[14px] opacity-60" />
                        )
                    )}

                </div>

            </div>
        </div>
    );
};