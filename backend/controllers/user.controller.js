import bcrypt from "bcryptjs"
import {v2 as cloudinary} from "cloudinary"
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js"
export const getUserProfile = async (req, res)=>{
    const {username} = req.params;

    try {
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({error:error.message});
    }
}

export const followUnfollowUser = async (req, res)=>{
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()){
            return res.status(400).json({error: "You can't follow/unfollow yourself"});
        }
        if(!userToModify || !currentUser){
            return res.status(400).json({error: "User not found"});
        }
        const isFollowing = currentUser.following.includes(id);
        console.log("hello")
        if(isFollowing){
            //unfollow the user
            // removing our id from his followers
            await User.findByIdAndUpdate(id, {$pull:{followers:req.user._id}});
            // removing his id from our following
            await User.findByIdAndUpdate(req.user._id, {$pull:{following:id}});
            res.status(200).json({message: "User unfollowed successfully"});
        }else{ 
            // Follow the user
            await User.findByIdAndUpdate(id, {$push:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push:{following:id}});
            // send notification to the user
            
            const newNotification = new Notification({
                type:"follow",
                from:req.user._id,
                to: userToModify._id
            })
            console.log("Creating follow notification:", newNotification);
            await newNotification.save();
            console.log("Follow notification saved successfully");
            res.status(200).json({message: "User followed successfully"});
        }
    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({error:error.message});
    }
}

export const getSuggestedUser = async(req,res)=>{
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne: userId}   // _id!=userId ne=not equal to
                }
            },
            {$sample: {size:10}}
        ])
        const filteredUsers = users.filter(user=>!usersFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0,4);

        suggestedUsers.forEach(user=>user.password=null)

        res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({error:error.message});
    }
}

export const updateUser = async (req, res)=>{
    const {fullName, email, username, currentPassword, newPassword, bio, link} = req.body.formData;
    
    let { profileImg, coverImg } = req.body.formData;
    const userId = req.user._id;
    
    try {
        let user = await User.findById(userId);
        
        if(!user) return res.status(404).json({message: "User not found"});

        if((!newPassword && currentPassword) || (newPassword && !currentPassword)){
            return res.status(400).json({error: "Please provide both current password and new password"})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) return res.status(400).json({error: "Current password is incorrecy"});
            if(newPassword.length<6){
                return res.status(400).json({error: "Password must be at least 6 characters long"});
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg){
            if(user.profileImg){
                //https://rez.cloudinary.com/cloudname/image/upload/someid/img_id.png
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]); //wrote this logic to fetch the img_id from above url
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                //https://rez.cloudinary.com/cloudname/image/upload/someid/img_id.png
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]); //if there is already image then we will destroy it and upload new
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        // console.log(user.fullName,"  " ,fullName);
        user = await user.save();

        user.password=null; // here password is null in response so that others can not see it and this will not change it in database as we are not saving it 
        return res.status(200).json(user);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}