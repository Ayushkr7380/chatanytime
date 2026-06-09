import { useState } from "react";
import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Item,
    ItemContent,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { FaPlus } from "react-icons/fa";
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="outline">
                    <FaPlus />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
                <FieldGroup>
                    <Field>
                        <Label className="m-2">
                            Search and start a new chat
                        </Label>
                        <input
                            value={keyword}
                            onChange={handleChange}
                            className="bg-gray-200 cursor-pointer rounded-lg px-2 py-1 m-2 hover:border-gray-400"
                            placeholder="Search by name or username"
                        />
                    </Field>
                </FieldGroup>

                {isLoading && (
                    <p className="text-center text-sm">Searching...</p>
                )}

                <div className="flex w-full max-w-md flex-col max-h-62.5 overflow-y-auto">
                    {!isLoading &&
                        debouncedKeyword &&
                        users?.length === 0 && (
                            <div className="py-6 text-center text-sm text-slate-500">
                                User not found
                            </div>
                        )}
                    <ItemGroup className="gap-0.5 mx-1">
                        {users?.map((user) => (
                            <Item
                                key={user._id}
                                variant="outline"
                                role="listitem"
                                className="py-1 px-2 cursor-pointer hover:bg-gray-300"
                                onClick={() => handleCreateChat(user._id)}
                            >
                                <ItemMedia variant="image">
                                    <img
                                        src={
                                            user?.privacy?.profilePic
                                                ? (user?.profilePic || dummyprofilepic)
                                                : dummyprofilepic
                                        }
                                        alt={user?.name}
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 object-cover rounded-full"
                                    />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle className="line-clamp-1">
                                        {user.name}
                                    </ItemTitle>

                                    <p className="text-xs text-slate-500">
                                        @{user.username}
                                    </p>
                                </ItemContent>
                            </Item>
                        ))}
                    </ItemGroup>
                </div>
            </DialogContent>
        </Dialog>
    );
};