export const TypingBubble = () => {
    return (
        <div className="flex justify-start my-2">
            <div className="bg-white text-slate-800 rounded-2xl rounded-bl-none shadow-sm px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
            </div>
        </div>
    );
};