import axios from 'axios';

export const api = axios.create({
    // Change this from "http://192.168.42.88:8000/api" to just "/api"
    baseURL: "/api", 
    withCredentials: true, 
});