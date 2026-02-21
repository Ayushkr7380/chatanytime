export const MessageBubble = ({ text, isSender, time }) => {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}>
      
      <div
        className={`max-w-[60%] px-3 py-2 rounded-2xl text-sm flex flex-col gap-1
        ${
          isSender
            ? "bg-black text-white rounded-br-none"
            : "bg-gray-200 text-black rounded-bl-none"
        }`}
      >
        {/* Message Text */}
        <p className="wrap-break-word">{text}</p>

        {/* Time */}
        <p className="text-[10px] opacity-60 text-right">
          {time}
        </p>
      </div>

    </div>
  );
};
