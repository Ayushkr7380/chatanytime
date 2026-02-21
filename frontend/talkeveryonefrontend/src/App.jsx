import './App.css'
import CustomRoutes from './routers/CustomRoutes'
import { Toaster } from "@/components/ui/sonner"

function App() {
 
  return (
    <>
      <CustomRoutes/>
      <Toaster position="top-center" />
    </>
      
  )
}

export default App
