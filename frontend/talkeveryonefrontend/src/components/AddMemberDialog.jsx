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

export default function AddMemberDialog({
    chatId,
}) {

    const [open, setOpen] = useState(false);

    const [keyword, setKeyword] =
        useState("");

    const [debouncedKeyword,
        setDebouncedKeyword] =
        useState("");

    const { data: users } =
        useSearch(debouncedKeyword);

    const {
        mutate: addMember,
    } = useAddMember();

    const handleSearch = (e) => {

        setKeyword(e.target.value);

        clearTimeout(window.groupSearch);

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

                    {users?.map((user) => (

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

                    ))}

                </div>

            </DialogContent>

        </Dialog>
    );
}