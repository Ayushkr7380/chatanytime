import { BsCheckAll } from "react-icons/bs";
import { useRef } from "react";
import { FaUserCircle, FaFilePdf, FaFile } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";

export const MessageBubble = ({
    text,
    isSender,
    time,
    isRead,
    senderName,
    senderPic,
    messageType = "user",
    fileName,
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
                <p className="text-[11px] text-slate-500 text-center max-w-[80%]">{text}</p>
            </div>
        );
    }

    const handlePointerDown = () => {
        touchMoved.current = false;
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            if (!touchMoved.current) {
                didLongPress.current = true;
                onSelect?.(messageId);
            }
        }, 500);
    };

    const handlePointerMove = () => {
        touchMoved.current = true;
        clearTimeout(longPressTimer.current);
    };

    const handlePointerUp = () => clearTimeout(longPressTimer.current);

    const handleClick = (e) => {
        if (didLongPress.current) {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => { didLongPress.current = false; }, 100);
            return;
        }
        if (isSelected) onSelect?.(messageId);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        onSelect?.(messageId);
    };

    const renderContent = () => {
        if (isDeleted) return <p className="break-words opacity-60 italic">{text}</p>;

        if (messageType === "uploading") {
            return (
                <div className="flex items-center gap-2 py-1">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <p className="text-sm opacity-70">Sending...</p>
                </div>
            );
        }

        if (messageType === "image") {
            return (
                <img
                    src={text}
                    alt="sent image"
                    className="rounded-xl max-w-[200px] max-h-[200px] object-cover cursor-pointer"
                    onClick={() => window.open(text, "_blank")}
                />
            );
        }
       

        if (messageType === "pdf") {
            return (
                <a href={text} target="_blank" rel="noopener noreferrer"
                    className="flex items.center gap-2 hover:opacity-80 transition-opacity">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isSender ? "bg-violet-500" : "bg-red-50"}`}>
                        <FaFilePdf className={`text-lg ${isSender ? "text-white" : "text-red-500"}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium truncate max-w-[140px]">{fileName || "Document.pdf"}</p>
                        <p className="text-[10px] opacity-60">PDF • Tap to download</p>
                    </div>
                   
                </a>
            );
        }

        if (messageType === "file") {
            return (
                <a href={text} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isSender ? "bg-violet-500" : "bg-blue-50"}`}>
                        <FaFile className={`text-lg ${isSender ? "text-white" : "text-blue-500"}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium truncate max-w-[140px]">{fileName || "File"}</p>
                        <p className="text-[10px] opacity-60">Tap to download</p>
                    </div>
                    
                </a>
            );
        }

        return <p className="break-words">{text}</p>;
    };

    return (
        <div
            className={`flex items-end ${isSender ? "justify-end" : "justify-start"} my-2`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
        >
            {isSelected && (
                <div className="flex items-center mr-2">
                    <div className="h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center">
                        <BsCheckAll className="text-white text-xs" />
                    </div>
                </div>
            )}

            {/* Group chat — other user ki DP */}
            {!isSender && senderName && (
                <div className="mr-1.5 shrink-0 mb-1">
                    {senderPic
                        ? <img src={senderPic} alt={senderName} className="h-7 w-7 rounded-full object-cover" />
                        : <FaUserCircle className="text-[28px] text-violet-400" />
                    }
                </div>
            )}

            <div className={`flex flex-col max-w-[70%] ${isSender ? "items-end" : "items-start"}`}>
                {/* Group chat sender name */}
                {!isSender && senderName && (
                    <p className="text-[11px] font-semibold text-violet-500 mb-0.5 ml-1">{senderName}</p>
                )}

                <div
                    className={`
                        px-3 py-2 rounded-2xl text-sm flex flex-col gap-1
                        transition-all duration-150
                        ${isSender
                            ? "bg-violet-600 text-white rounded-br-none"
                            : "bg-white text-slate-800 rounded-bl-none shadow-sm"
                        }
                        ${isSelected ? "opacity-75 scale-[0.97]" : ""}
                    `}
                >
                    {renderContent()}

                    {messageType !== "uploading" && (
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
                    )}
                </div>
            </div>
        </div>
    );
};