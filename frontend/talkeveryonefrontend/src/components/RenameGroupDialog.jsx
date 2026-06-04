import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useRenameGroup } from "@/hooks/useRenameGroup";

export default function RenameGroupDialog({
    chatId,
    currentName,
}) {

    const [open, setOpen] = useState(false);
    const [groupName, setGroupName] =
        useState(currentName);

    const {
        mutate: renameGroup,
        isPending,
    } = useRenameGroup();

    const handleRename = () => {

        if (!groupName.trim()) return;

        renameGroup(
            {
                chatId,
                groupName,
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
                    variant="outline"
                    className="mt-4"
                >
                    Rename Group
                </Button>

            </DialogTrigger>

            <DialogContent>

                <DialogHeader>
                    <DialogTitle>
                        Rename Group
                    </DialogTitle>
                </DialogHeader>

                <Input
                    value={groupName}
                    onChange={(e) =>
                        setGroupName(e.target.value)
                    }
                />

                <Button
                    onClick={handleRename}
                    disabled={isPending}
                >
                    {
                        isPending
                            ? "Updating..."
                            : "Save"
                    }
                </Button>

            </DialogContent>
        </Dialog>
    );
}