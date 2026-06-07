import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import UserContext from './context/userContext/userContext.jsx'
import SocketContext from './context/socketContext/SocketContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
      <QueryClientProvider client={queryClient}>
      <SocketContext>
        {/* <UserContext> */}
          <App />
        {/* </UserContext> */}
      </SocketContext>
    </QueryClientProvider>
  </BrowserRouter>
  // </StrictMode>,
)


