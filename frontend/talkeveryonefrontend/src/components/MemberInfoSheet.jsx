import { FaUserCircle } from "react-icons/fa";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { useMakeAdmin } from "@/hooks/useMakeAdmin";
import { useRemoveMember } from "@/hooks/useRemoveMember";

export default function MemberInfoSheet({
    open,
    onOpenChange,
    member,
    isAdmin,
    currentUserId,
    chatId,
}) {

    const { mutate: makeAdmin, isPending: makingAdmin } =
        useMakeAdmin();

    const { mutate: removeMember, isPending: removingMember } =
        useRemoveMember();

    const handleMakeAdmin = () => {
        makeAdmin(
            {
                chatId,
                userId: member._id,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    const handleRemoveMember = () => {
        removeMember(
            {
                chatId,
                userId: member._id,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Sheet
            open={open}
            onOpenChange={onOpenChange}
        >
            <SheetContent>

                <SheetHeader>
                    <SheetTitle>
                        Member Info
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-8 flex flex-col items-center">

                    <FaUserCircle
                        className="
                            text-8xl
                            text-violet-500
                        "
                    />

                    <h2 className="mt-4 text-xl font-bold">
                        {member?.name}
                    </h2>

                    <p className="text-slate-500">
                        @{member?.username}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                        {member?.email}
                    </p>

                </div>

                {isAdmin &&
                    member?._id !== currentUserId && (
                        <div className="mt-10 space-y-3">

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleMakeAdmin}
                                disabled={makingAdmin}
                            >
                                {makingAdmin
                                    ? "Updating..."
                                    : "Make Admin"}
                            </Button>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleRemoveMember}
                                disabled={removingMember}
                            >
                                {removingMember
                                    ? "Removing..."
                                    : "Remove Member"}
                            </Button>

                        </div>
                    )}

            </SheetContent>
        </Sheet>
    );
}