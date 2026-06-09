import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSearch } from "@/hooks/useSearch";
import { useAddMember } from "@/hooks/useAddMember";
import { useMe } from "@/hooks/useMe";
import { useChats } from "@/hooks/useChats";

export default function AddMemberDialog({ chatId }) {

    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [addingId, setAddingId] = useState(null);

    const { data: users = [] } = useSearch(debouncedKeyword);
    const { data: meData } = useMe();
    const { data: chats = [] } = useChats();
    const { mutate: addMember } = useAddMember();

    const group = chats.find(c => c._id === chatId);

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        clearTimeout(window.groupSearch);
        window.groupSearch = setTimeout(() => {
            setDebouncedKeyword(e.target.value);
        }, 500);
    };

    const handleAddMember = (userId) => {
        setAddingId(userId);
        addMember({ chatId, userId }, {
            onSuccess: () => {
                setAddingId(null);
                setOpen(false);
            },
            onError: () => setAddingId(null)
        });
    };

    const availableUsers = users.filter(user =>
        user._id !== meData?.user?._id &&
        !group?.users?.some(m => m._id === user._id)
    );

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) { setKeyword(""); setDebouncedKeyword(""); }
        }}>
            <DialogTrigger asChild>
                <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-violet-600 text-lg">+</span>
                    </div>
                    <span className="text-sm text-violet-600 font-medium">Add member</span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add member</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative mt-1">
                    <IoSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={keyword}
                        onChange={handleSearch}
                        autoFocus
                        placeholder="Search user..."
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-slate-50"
                    />
                </div>

                {/* Users */}
                <div className="max-h-[280px] overflow-y-auto mt-1 space-y-0.5">
                    {!debouncedKeyword && (
                        <p className="text-center text-sm text-slate-400 py-6">Type to search users</p>
                    )}
                    {debouncedKeyword && availableUsers.length === 0 && (
                        <p className="text-center text-sm text-slate-500 py-6">No users found</p>
                    )}
                    {availableUsers.map(user => (
                        <div
                            key={user._id}
                            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            {user?.privacy?.profilePic && user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-violet-100 shrink-0"
                                />
                            ) : (
                                <FaUserCircle className="text-4xl text-violet-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                            </div>
                            <button
                                onClick={() => handleAddMember(user._id)}
                                disabled={addingId === user._id}
                                className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors shrink-0 min-w-[48px] flex items-center justify-center"
                            >
                                {addingId === user._id
                                    ? <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    : "Add"
                                }
                            </button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}