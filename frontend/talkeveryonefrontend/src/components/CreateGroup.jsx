"use client"

import { useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import { IoSearch, IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { useSearch } from "@/hooks/useSearch";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import { useMe } from "@/hooks/useMe";
// import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import { FaUserCircle } from "react-icons/fa";

import { toast } from "sonner";

export default function CreateGroup() {

    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]); // [{ _id, name }]
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [open, setOpen] = useState(false);

    const { data: meData } = useMe();

    const { data: users, isLoading } = useSearch(debouncedKeyword);

    const { mutate: createGroup, isPending } = useCreateGroup(() => {
        setOpen(false);
        setGroupName("");
        setSelectedUsers([]);
        setKeyword("");
        setDebouncedKeyword("");
    });

    const handleChange = (e) => {
        setKeyword(e.target.value);
        clearTimeout(window._groupSearchTimer);
        window._groupSearchTimer = setTimeout(() => {
            setDebouncedKeyword(e.target.value);
        }, 500);
    };

    const handleSelectUser = (user) => {
        setSelectedUsers(prev =>
            prev.find(u => u._id === user._id)
                ? prev.filter(u => u._id !== user._id)
                : [...prev, { _id: user._id, name: user.name }]
        );
    };

    const handleRemoveChip = (userId) => {
        setSelectedUsers(prev => prev.filter(u => u._id !== userId));
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (!groupName.trim()) return toast.error("Group name is required.");
        if (selectedUsers.length < 2) return toast.error("Select at least 2 members.");
        createGroup({
            groupName,
            groupMembers: selectedUsers.map(u => u._id),
        });
    };

    const availableUsers = users?.filter(u => u._id !== meData?.user?._id) || [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <MdOutlineGroupAdd />
                    Group
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleCreateGroup}>
                    <DialogHeader>
                        <DialogTitle>Create Group</DialogTitle>
                    </DialogHeader>

                    {/* Group name input */}
                    <div className="mt-4 mx-1 relative">
                        <input
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="Group name..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-slate-50"
                        />
                    </div>

                    {/* Selected chips */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mx-1 mt-3">
                            {selectedUsers.map(u => (
                                <div
                                    key={u._id}
                                    className="flex items-center gap-1 bg-violet-100 text-violet-700 rounded-full px-3 py-1 text-xs font-medium"
                                >
                                    {u.name}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveChip(u._id)}
                                        className="ml-1 hover:text-violet-900"
                                    >
                                        <IoClose size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search input */}
                    <div className="mx-1 mt-3 relative">
                        <IoSearch
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={keyword}
                            onChange={handleChange}
                            placeholder="Add members..."
                            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-slate-50"
                        />
                    </div>

                    {isLoading && (
                        <p className="text-center text-sm text-slate-400 mt-2">Searching...</p>
                    )}

                    {/* Users list */}
                    <div className="mt-2 max-h-[200px] overflow-y-auto mx-1 space-y-0.5">
                        {availableUsers.length === 0 && debouncedKeyword ? (
                            <p className="text-center text-sm text-slate-500 py-4">No users found</p>
                        ) : (
                            availableUsers.map(user => {
                                const isSelected = selectedUsers.some(u => u._id === user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`
                                            flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors
                                            ${isSelected ? "bg-violet-50" : "hover:bg-slate-50"}
                                        `}
                                    >
                                        {/* checkbox style */}
                                        <div className={`
                                            h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                                            ${isSelected ? "bg-violet-600 border-violet-600" : "border-slate-300"}
                                        `}>
                                            {isSelected && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>

                                        {user?.privacy?.profilePic && user?.profilePic ? (
                                            <img
                                                src={user.profilePic}
                                                alt={user.name}
                                                className="h-9 w-9 object-cover rounded-full shrink-0"
                                            />
                                        ) : (
                                            <FaUserCircle className="text-4xl text-violet-400 shrink-0" />
                                        )}

                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                                            <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Group"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}