import mongoose from "mongoose";

const URI = process.env.MONGOURI;

const DbConfig = async()=>{
    try {
        const { connection } = await mongoose.connect(URI);
        if(!connection){
            console.log(`Connection to DB failed!,Try again later!`);
        }
        else{
            console.log(`DB connected : ${connection.host}`);
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default DbConfig;