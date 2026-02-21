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
                <div className="h-screen w-[25%]">
                    <div className="mx-1 my-2 flex justify-between px-1">
                        <h2 className="font-bold text-xl">Chats</h2>
                        <div className="flex">
                            <SearchUser/>
                            <CreateGroup/>
                        </div>
                    </div>
                    <Messages/>
                    <div className="fixed bottom-0 flex justify-start font-bold bg-black text-white">
                        <p>
                             {userData?.user?.name}
                        </p>
                       
                    </div>
                </div>
                <div className="h-screen w-[75%]">
                    <Outlet/>
                </div>

            </div>

        </>
    )
}

export default Home;