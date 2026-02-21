import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserContext from './context/userContext/userContext.jsx'
import SocketContext from './context/socketContext/socketContext.jsx'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
      <SocketContext>
        <UserContext>
          <App />


        </UserContext>
      </SocketContext>
  </BrowserRouter>
  // </StrictMode>,
)
