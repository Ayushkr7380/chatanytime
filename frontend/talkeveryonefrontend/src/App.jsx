import { useEffect } from 'react';
import './App.css'
import CustomRoutes from './routers/CustomRoutes'
import { Toaster } from "@/components/ui/sonner"

function App() {

  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`
      );
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);
 
  return (
    <>
      <CustomRoutes/>
      <Toaster position="top-center" />
    </>
      
  )
}

export default App
