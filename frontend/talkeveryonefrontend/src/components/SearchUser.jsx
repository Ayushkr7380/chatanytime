import { CreateUserContext } from "@/context/userContext/CreateUserContext";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaPlus } from "react-icons/fa";
export const SearchUser = () => {

    const userContext = useContext(CreateUserContext);
    const { search, searchUsers ,openDialogPrivateChat ,setOpenDialogPrivateChat,createNewChat} = userContext;
    const {
        register,
        // handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const searchValue = watch("search");

    console.log("ssss", searchUsers);


    useEffect(() => {

        const timer = setTimeout(() => {
            search(searchValue);
        }, 500);

        return () => clearTimeout(timer);

    }, [searchValue]);

    // const handleChat = (id)=>{
    //     console.log("id for the creation od chat ",id);
    // }

    return (
        <>

            <Dialog open={openDialogPrivateChat} onOpenChange={setOpenDialogPrivateChat}>

                <DialogTrigger>
                    <Button variant="outline"><FaPlus /></Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1" className="m-2">Search and start a new chat</Label>
                            <input
                                id="name-1"
                                name="name"
                                className="bg-gray-200 cursor-pointer rounded-lg px-2 py-1 m-2 hover:border-gray-400"
                                {...register("search", { required: "Enter name or username" })}
                            />
                        </Field>

                    </FieldGroup>
                    <div className="flex w-full max-w-md flex-col max-h-[250px] overflow-y-auto">
                        <ItemGroup className="gap-0.5  mx-1">
                            {searchUsers && searchUsers?.users.map((user) => (
                                <Item key={user._id} variant="outline" role="listitem" className="py-1 px-2" onClick={()=>createNewChat(user._id)}>
                                    
                                        <ItemMedia variant="image">
                                            <img
                                                src={dummyprofilepic}
                                                alt={""}
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
        </>
    )
}