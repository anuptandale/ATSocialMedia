import path from "path"
import express from "express"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import paymentRoutes from "./routes/payment.route.js"
import notificationRoutes from "./routes/notification.route.js"
import dotenv from 'dotenv'
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from 'cloudinary';
// import cors from "cors";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
// app.use(cors());
app.use(express.json({limit:"5mb"})); // middleware to parse req.body
//before we are not able to upload image in post as default limit is 4kb so we set limit of 5mb now we can upload the images with size less equal to 5mb
app.use(express.urlencoded({extended: true})); //to parse form data(url) bcz of this we can write payload in urlencoded except raw(json) in postman

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontend/dist")));
    app.get("*", (req,res)=>{
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    })
}

// console.log(process.env.MONGO_URI)
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
    connectMongoDB();
})