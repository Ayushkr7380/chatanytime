import { BsCheckAll } from "react-icons/bs";
import { useRef } from "react";

export const MessageBubble = ({
    text,
    isSender,
    time,
    isRead,
    senderName,
    messageType = "user",
    isDeleted = false,
    isEdited = false,
    messageId,
    isSelected = false,
    onSelect,
}) => {

    const longPressTimer = useRef(null);
    const didLongPress = useRef(false);
    const touchMoved = useRef(false);

    if (messageType === "system") {
        return (
            <div className="flex justify-center my-3">
                <p className="text-[11px] text-slate-500 text-center max-w-[80%]">
                    {text}
                </p>
            </div>
        );
    }

    const handleLongPressStart = () => {
        touchMoved.current = false;
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            if (!touchMoved.current) {
                didLongPress.current = true;
                onSelect?.(messageId);
            }
        }, 500);
    };

    const handleLongPressEnd = () => {
        clearTimeout(longPressTimer.current);
        
    };

    const handleTouchMove = () => {
        touchMoved.current = true;
        clearTimeout(longPressTimer.current);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        onSelect?.(messageId);
    };

    const handleClick = () => {
        if (didLongPress.current) return;
        if (isSelected) onSelect?.(messageId);
    };

    return (
        <div
            className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}
            onTouchStart={handleLongPressStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleLongPressEnd}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
        >
            {/* select indicator — left side */}
            {isSelected && (
                <div className="flex items-center mr-2">
                    <div className="h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center">
                        <BsCheckAll className="text-white text-xs" />
                    </div>
                </div>
            )}

            <div
                className={`
                    max-w-[70%] px-3 py-2 rounded-2xl text-sm flex flex-col gap-1
                    transition-all duration-150
                    ${isSender
                        ? "bg-violet-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 rounded-bl-none shadow-sm"
                    }
                    ${isSelected ? "opacity-75 scale-[0.97]" : ""}
                `}
            >
                {senderName && (
                    <p className="text-xs font-semibold text-violet-900">
                        {senderName}
                    </p>
                )}

                <p className={`break-words ${isDeleted ? "opacity-60 italic" : ""}`}>
                    {text}
                </p>

                <div className="flex items-center justify-end gap-1">
                    {isEdited && !isDeleted && (
                        <p className="text-[10px] opacity-50">edited</p>
                    )}
                    <p className="text-[10px] opacity-60">{time}</p>
                    {isSender && (
                        isRead
                            ? <BsCheckAll className="text-[14px] text-blue-300" />
                            : <BsCheckAll className="text-[14px] opacity-60" />
                    )}
                </div>
            </div>
        </div>
    );
};