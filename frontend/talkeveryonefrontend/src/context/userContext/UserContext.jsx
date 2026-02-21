import axios from "axios";
import { CreateUserContext } from "./createUserContext";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CreateSocketContext } from "../socketContext/CreateSocketContext";

function UserContext(props) {
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  
  const [userData, setUserData] = useState(null);
  const [fetchChats , setFetchChats] = useState(null);
  const [messages ,setMessages] = useState(null);
  const [searchUsers , setSearchUsers] = useState(null);
  const [openDialogPrivateChat , setOpenDialogPrivateChat] = useState(false);
  const [newChat , setNewChat] = useState(null);



  const socketContext = useContext(CreateSocketContext);

  const { connectSocket ,sendMessageSocket ,joinAllChats} = socketContext;


  // Register
  const registration = async (data) => {
    try {
      const response = await axios.post(
        `${backendURL}/auth/registerUser`,
        data,
        { withCredentials: true }
      );

      setUserData(response.data);
      connectSocket({
        userId : response.data.user._id,
        name : response.data.user.name
      });
      toast.success("User Registered");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    }
  };

  // Login
  const login = async (data) => {
    try {
      const response = await axios.post(
        `${backendURL}/auth/loginUser`,
        data,
        { withCredentials: true }
      );

      setUserData(response.data);
      connectSocket({
        userId : response.data.user._id,
        name : response.data.user.name
      });
      toast.success("User Logged In");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  //Auto login check
  const getUserDetails = async () => {
    try {
      const response = await axios.get(
        `${backendURL}/auth/me`,
        { withCredentials: true }
      );
      console.log("loggedin user id : ",response.data.user._id);
      
      connectSocket({
        userId : response.data.user._id,
        name : response.data.user.name
      });
      setUserData(response.data);
    } catch (error) {
      setUserData(null);
      console.log(error.response?.data);
    }
  };

  const fetchAllChats = async()=>{
    try {
      const response = await axios.get(`${backendURL}/user/all-chats`,{withCredentials:true});
      // console.log(response.data);
      joinAllChats(response.data.chats);
      setFetchChats(response.data.chats);
      
    } catch (error) {
      console.log(error.response?.data);
      
    }
  }

  const fetchMessages = async(chatId)=>{
    try {
      const response = await axios.get(`${backendURL}/user/message/${chatId}`,{withCredentials:true});
      console.log("all messages ",response.data);
      // joinChatRoom(chatId);
      setMessages(response.data.messages);
      
    } catch (error) {
      console.log(error.response?.data);
      
    }
  }

  const sendMessage = async({content,chatId})=>{
    try {
      
      const response = await axios.post(`${backendURL}/user/message`,{
        content,chatId
      },{withCredentials:true});
    // console.log(content);
    // console.log(chatId);
      sendMessageSocket({
        content,chatId
      });
      console.log("sent message ",response.data);
    } catch (error) {
        console.log(error.response?.data);
        toast.error("Failed to send message.")
    }
  }

  const search = async(text)=>{
    try {
      setSearchUsers(null);
      const response = await axios.get(`${backendURL}/auth/searchUser`,{params:{search:text},withCredentials:true});
      console.log(response.data);
      setSearchUsers(response.data);
    } catch (error) {
      setSearchUsers(null);
      console.log(error.response?.data);
    }
  }

  const createNewChat = async(otherUserId)=>{
    try {
      
      const response = await axios.post(`${backendURL}/user/chat/${otherUserId}`,{},{withCredentials:true});
      console.log("new chat",response.data);
      const chatId = response.data.chat._id;
      setOpenDialogPrivateChat(false);
      
      setNewChat(response.data.chat);
      navigate(`/chat/${chatId}`);
      
      
    } catch (error) {
      
      console.log(error.response?.data);
      toast.error(error.response?.data?.message)
    }
    finally{
      setOpenDialogPrivateChat(false);
    }
  }

  return (
    <CreateUserContext.Provider
      value={{ login, registration, getUserDetails, userData ,fetchAllChats ,fetchChats ,fetchMessages,messages ,setMessages,sendMessage ,search ,searchUsers,createNewChat,openDialogPrivateChat,setOpenDialogPrivateChat ,newChat}}
    >
      {props.children}
    </CreateUserContext.Provider>
  );
}

export default UserContext;
