import server from "./app.js"
import DbConfig from "./config/dbconfig.js";
const PORT = process.env.PORT || 2000;

server.listen(PORT,async()=>{
    await DbConfig();
    console.log(`Server is running at PORT ${PORT}`);
})