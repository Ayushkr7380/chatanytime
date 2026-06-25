import {
  Card,
  CardContent,
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-violet-200 rounded-2xl p-6 w-full max-w-sm">
        <Tabs defaultValue="Login">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="Login" className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="Registration" className="flex-1">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="Login"><Login /></TabsContent>
          <TabsContent value="Registration"><Registration /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
