"use client"

import { useState } from "react"
import { MdOutlineGroupAdd } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { useSearch } from "@/hooks/useSearch"
import { useCreateGroup } from "@/hooks/useCreateGroup"
import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png"
import { toast } from "sonner"

export default function CreateGroup() {

    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [open, setOpen] = useState(false);

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

    const handleSelectUser = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (!groupName.trim()) return toast.error("Group name is required.");
        if (selectedUsers.length < 2) return toast.error("Select at least 2 members.");
        createGroup({ groupName, groupMembers: selectedUsers });
    };

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

                    {/* Group Name */}
                    <div className="mt-4 mx-1">
                        <Input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name..."
                        />
                    </div>

                    {/* Search Users */}
                    <div className="mx-1 my-2">
                        <Input
                            value={keyword}
                            onChange={handleChange}
                            placeholder="Search users..."
                            className="bg-gray-100"
                        />
                    </div>

                    {isLoading && (
                        <p className="text-center text-sm text-slate-400">Searching...</p>
                    )}

                    {/* Selected count */}
                    {selectedUsers.length > 0 && (
                        <p className="text-xs text-violet-600 mx-1 mb-1">
                            {selectedUsers.length} member(s) selected
                        </p>
                    )}

                    {/* Users List */}
                    <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto mx-1">
                        {users && users.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center gap-3 cursor-pointer"
                               
                            >
                                <Checkbox
                                    checked={selectedUsers.includes(user._id)}
                                    onCheckedChange={() => handleSelectUser(user._id)}
                                />
                                <Item variant="outline" size="xs" className="w-full">
                                    <ItemMedia variant="image">
                                        <img
                                            src={dummyprofilepic}
                                            alt={user.name}
                                            width={28}
                                            height={28}
                                            className="object-cover rounded-full grayscale"
                                        />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>{user.name}</ItemTitle>
                                        <ItemDescription>{user.username}</ItemDescription>
                                    </ItemContent>
                                </Item>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="mt-6">
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