import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { useSearch } from "@/hooks/useSearch";
import { useAddMember } from "@/hooks/useAddMember";
import { useMe } from "@/hooks/useMe";
import { useChats } from "@/hooks/useChats";

export default function AddMemberDialog({
    chatId,
}) {

    const [open, setOpen] = useState(false);

    const [keyword, setKeyword] =
        useState("");

    const [
        debouncedKeyword,
        setDebouncedKeyword,
    ] = useState("");

    const { data: users = [] } =
        useSearch(debouncedKeyword);

    const { data: meData } =
        useMe();

    const { data: chats = [] } =
        useChats();

    const group = chats.find(
        (chat) => chat._id === chatId
    );

    const {
        mutate: addMember,
    } = useAddMember();

    const handleSearch = (e) => {

        setKeyword(e.target.value);

        clearTimeout(
            window.groupSearch
        );

        window.groupSearch =
            setTimeout(() => {

                setDebouncedKeyword(
                    e.target.value
                );

            }, 500);
    };

    const handleAddMember =
        (userId) => {

            addMember(
                {
                    chatId,
                    userId,
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                    },
                }
            );
        };

    const availableUsers =
        users.filter(
            (user) =>
                user._id !==
                    meData?.user?._id &&
                !group?.users?.some(
                    (member) =>
                        member._id ===
                        user._id
                )
        );

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >

            <DialogTrigger asChild>

                <Button
                    className="
                        w-full
                        bg-violet-600
                        hover:bg-violet-700
                    "
                >
                    Add Member
                </Button>

            </DialogTrigger>

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>
                        Add Member
                    </DialogTitle>

                </DialogHeader>

                <Input
                    value={keyword}
                    onChange={handleSearch}
                    placeholder="Search user..."
                />

                <div
                    className="
                        max-h-64
                        overflow-y-auto
                        mt-2
                    "
                >

                    {availableUsers.length === 0 ? (
                        <p
                            className="
                                text-center
                                text-sm
                                text-slate-500
                                py-4
                            "
                        >
                            No users found
                        </p>
                    ) : (
                        availableUsers.map(
                            (user) => (

                                <div
                                    key={user._id}
                                    onClick={() =>
                                        handleAddMember(
                                            user._id
                                        )
                                    }
                                    className="
                                        p-3
                                        border-b
                                        cursor-pointer
                                        hover:bg-slate-50
                                    "
                                >

                                    <p>
                                        {user.name}
                                    </p>

                                    <p
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        @{user.username}
                                    </p>

                                </div>

                            )
                        )
                    )}

                </div>

            </DialogContent>

        </Dialog>
    );
}