// import { useMemo } from "react";
import {io} from "socket.io-client";

const BackendURL = import.meta.env.VITE_BACKEND_URL;

const socket = io(BackendURL, {
  autoConnect: false, // manually connect
});

export default socket;