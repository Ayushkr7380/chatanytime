import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Registration from "./Registration"
import Login from "./Login"

export default function ToggleAuth() {
  return (
    <div className="flex justify-center mt-10">
        <Tabs defaultValue="Registration" className="w-[400px] ">
            <div className="flex justify-center">
                <TabsList >
                    <TabsTrigger value="Registration">Registration</TabsTrigger>
                    <TabsTrigger value="Login">Login</TabsTrigger>
                </TabsList>
            </div>
        
        <TabsContent value="Registration">
            <Card>
            <CardContent className="text-muted-foreground text-sm">
                <Registration/>
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="Login">
            <Card>
            <CardContent className="text-muted-foreground text-sm">
                <Login/>
            </CardContent>
            </Card>
        </TabsContent>
        
        </Tabs>
    </div>
  )
}
