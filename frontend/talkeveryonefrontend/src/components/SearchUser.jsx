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
import { useCreateChat } from "@/hooks/useCreateChat";

export const SearchUser = () => {

    const [open, setOpen] = useState(false);

    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");

    const { mutate: createChat } = useCreateChat();

    const handleCreateChat = (userId) => {
        createChat(userId);
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
                    <p className="text-center text-sm">
                        Searching...
                    </p>
                )}

                <div className="flex w-full max-w-md flex-col max-h-62.5 overflow-y-auto">
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
                                        src={dummyprofilepic}
                                        alt=""
                                        width={28}
                                        height={28}
                                        className="object-cover rounded-full grayscale"
                                    />
                                </ItemMedia>

                                <ItemContent>
                                    <ItemTitle className="line-clamp-1">
                                        {user.name}
                                    </ItemTitle>
                                </ItemContent>
                            </Item>
                        ))}
                    </ItemGroup>
                </div>
            </DialogContent>
        </Dialog>
    );
};