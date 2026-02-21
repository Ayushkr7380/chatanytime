import Messages from "./Messages";
import { Input } from "@/components/ui/input"
import { MdOutlineGroupAdd } from "react-icons/md";
import CreateGroup from "./CreateGroup";
import Chat from "./Chat";
import { useContext, useEffect } from "react";
import { CreateUserContext } from "@/context/userContext/CreateUserContext";
import { Outlet } from "react-router-dom";
import { SearchUser } from "./SearchUser";

function Home(){

    const userContext = useContext(CreateUserContext);

    const { userData , getUserDetails} = userContext;

    console.log("userdata from backend : ",userData);

   useEffect(() => {
        getUserDetails();
    }, []); 


// useEffect(() => {
//   if (userData) {
//     toast.success("Welcome back");
//   }
// },[userData])
    
    return(
        <>  
            
            <div className="flex h-screen">
                <div className=" w-[25%]">
                    <div className="mx-1 my-2 flex justify-between px-1">
                        <h2 className="font-bold text-xl">Chats</h2>
                        <div className="flex">
                            <SearchUser/>
                            <CreateGroup/>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <Messages />
                    </div>
                    <div className="fixed bottom-0 p-1 w-[25%] flex justify-start font-bold bg-black text-white">
                        <p >
                             {userData?.user?.name}
                        </p>
                       
                    </div>
                </div>
                <div className=" w-[75%] overflow-y-auto">
                    <Outlet/>
                </div>

            </div>

        </>
    )
}

export default Home;