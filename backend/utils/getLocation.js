import axios from "axios";

export const getLocation = async (ip) => {
    try {
       
        if (ip === "::1" || ip === "127.0.0.1") return "Localhost";
        
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const { city, regionName, country } = response.data;
        return `${city}, ${regionName}, ${country}`;
    } catch {
        return "Unknown";
    }
};