import { useEffect } from 'react';
import './App.css'
import CustomRoutes from './routers/CustomRoutes'
import { Toaster } from "@/components/ui/sonner"

function App() {

  useEffect(() => {
    const setAppHeight = () => {
      const height =
        window.visualViewport?.height || window.innerHeight;

      document.documentElement.style.setProperty(
        "--app-height",
        `${height}px`
      );
    };

    setAppHeight();

    window.addEventListener("resize", setAppHeight);
    window.visualViewport?.addEventListener(
      "resize",
      setAppHeight
    );

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.visualViewport?.removeEventListener(
        "resize",
        setAppHeight
      );
    };
  }, []);

  return (
    <>
      <CustomRoutes />
      <Toaster position="top-center" />
    </>

  )
}

export default App
