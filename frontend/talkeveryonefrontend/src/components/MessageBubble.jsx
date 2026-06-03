export const MessageBubble = ({
    text,
    isSender,
    time,
}) => {
    return (
        <div
            className={`flex ${
                isSender
                    ? "justify-end"
                    : "justify-start"
            } mb-3`}
        >
            <div
                className={`
                    max-w-[80%]
                    sm:max-w-[70%]
                    px-4
                    py-3
                    rounded-2xl
                    shadow-sm
                    break-words
                    ${
                        isSender
                            ? `
                                bg-violet-600
                                text-white
                                rounded-br-md
                              `
                            : `
                                bg-white
                                text-slate-800
                                border
                                border-slate-200
                                rounded-bl-md
                              `
                    }
                `}
            >
                <p className="text-sm leading-relaxed">
                    {text}
                </p>

                <p
                    className={`
                        text-[10px]
                        mt-1
                        text-right
                        ${
                            isSender
                                ? "text-violet-200"
                                : "text-slate-400"
                        }
                    `}
                >
                    {time}
                </p>
            </div>
        </div>
    );
};