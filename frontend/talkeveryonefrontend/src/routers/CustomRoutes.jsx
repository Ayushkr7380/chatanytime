import {Routes , Route } from "react-router-dom";
import Registration from "../components/Registration";
import Home from "../components/Home";
import Login from "../components/Login";
import  ToggleAuth  from "../components/ToggleAuth";
import Chat from "@/components/Chat";


function CustomRoutes(){
       

    return(
        <>
            <Routes>
                
                <Route path="/authenticaton" element={<ToggleAuth/>}></Route>
                <Route path="/" element={<Home/>}>
                    <Route path="/chat/:chatId" element={<Chat/>}></Route>
                </Route>
                
            </Routes>        
        </>
    )

}

export default CustomRoutes;