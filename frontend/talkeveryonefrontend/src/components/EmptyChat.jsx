import { BsChatDots } from "react-icons/bs";

export default function EmptyChat() {
    return (
        <div
            className="
                hidden
                md:flex
                flex-col
                items-center
                justify-center
                h-full
                w-full
                bg-slate-50
                text-center
                px-6
            "
        >
            <div
                className="
                    h-24
                    w-24
                    rounded-full
                    bg-violet-100
                    flex
                    items-center
                    justify-center
                    mb-6
                "
            >
                <BsChatDots
                    className="
                        text-5xl
                        text-violet-600
                    "
                />
            </div>

            <h2
                className="
                    text-2xl
                    font-bold
                    text-slate-800
                "
            >
                Welcome to ChitChat
            </h2>

            <p
                className="
                    mt-2
                    text-slate-500
                    max-w-md
                "
            >
                Select a conversation from the sidebar
                or start a new chat using the +
                button.
            </p>
        </div>
    );
}