import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { CreateUserContext } from "@/context/userContext/CreateUserContext";
import { useContext, useEffect } from "react"
import { Link } from "react-router-dom";


export default function Messages() {

  const userContext = useContext(CreateUserContext);

  const { fetchAllChats , fetchChats ,userData} = userContext;
  useEffect(()=>{
      fetchAllChats();
  },[]);

 console.log(fetchChats);

//  const otherUser = 
 

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup className="gap-1  mx-1">
        {fetchChats && fetchChats.map((data) => (
          <Item key={data._id} variant="outline" asChild role="listitem" >
            <Link to={`/chat/${data._id}` }>
              <ItemMedia variant="image">
                <img
                  src={dummyprofilepic}
                  alt={data.latestMessage?.content}
                  width={32}
                  height={32}
                  className="object-cover grayscale"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  { data.users.find((u)=>u._id !== userData?.user?._id)?.name} {" "}
                  {/* <span className="text-muted-foreground">{data.latestMessage?.content}</span> */}
                </ItemTitle>
                <div className="flex justify-between">
                <ItemDescription>{data.latestMessage?.content}</ItemDescription>
                 <ItemDescription>{new Date(data.updatedAt).toLocaleTimeString([],{
                  hour12:true,
                  hour:"numeric",
                  minute:"2-digit"
                 })}</ItemDescription>

                </div>
              </ItemContent>
              {/* <ItemContent className="flex-none text-center">
                <ItemDescription>{data.updatedAt}</ItemDescription>
              </ItemContent> */}
            </Link>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
