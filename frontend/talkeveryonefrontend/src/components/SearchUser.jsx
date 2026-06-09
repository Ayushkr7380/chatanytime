import { useState } from "react";
// import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useSearch } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { useChats } from "@/hooks/useChats";

export const SearchUser = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const { data: chats = [] } = useChats();

    const handleCreateChat = (userId) => {
        const existingChat = chats.find(chat =>
            !chat.isGroupChat &&
            chat.users.some(u => u._id === userId)
        );
        if (existingChat) {
            navigate(`/chat/${existingChat._id}`);
        } else {
            navigate(`/new-chat/${userId}`);
        }
        setOpen(false);
    };

    const handleChange = (e) => {
        setKeyword(e.target.value);
        clearTimeout(window._searchTimer);
        window._searchTimer = setTimeout(() => {
            setDebouncedKeyword(e.target.value);
        }, 500);
    };

    const { data: users, isLoading } = useSearch(debouncedKeyword);

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) { setKeyword(""); setDebouncedKeyword(""); }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FaPlus />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">

                {/* Title */}
                <div className="mb-1">
                    <p className="text-sm font-semibold text-slate-800">New chat</p>
                    <p className="text-xs text-slate-400">Search by name or username</p>
                </div>

                {/* Search input */}
                <div className="relative">
                    <IoSearch
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={keyword}
                        onChange={handleChange}
                        autoFocus
                        placeholder="Search..."
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-slate-50"
                    />
                </div>

                {/* Results */}
                <div className="max-h-[280px] overflow-y-auto mt-1 space-y-0.5">
                    {isLoading && (
                        <p className="text-center text-sm text-slate-400 py-4">Searching...</p>
                    )}

                    {!isLoading && debouncedKeyword && users?.length === 0 && (
                        <p className="text-center text-sm text-slate-500 py-6">No user found</p>
                    )}

                    {!isLoading && !debouncedKeyword && (
                        <p className="text-center text-sm text-slate-400 py-6">Type to search users</p>
                    )}

                    {users?.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleCreateChat(user._id)}
                            className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            {user?.privacy?.profilePic && user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={user.name}
                                    className="h-10 w-10 object-cover rounded-full border-2 border-violet-100 shrink-0"
                                />
                            ) : (
                                <FaUserCircle className="text-4xl text-violet-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </DialogContent>
        </Dialog>
    );
};