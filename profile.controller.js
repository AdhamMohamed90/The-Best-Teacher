const {findTeacherProfileByUserId} = require("../models/teacher.model");
const {updateTeacherProfile, deleteTeacherProfile} = require("../models/teacher.model");

function getProfile(req,res){
    try{
        // console.log("REQ.USER:", req.user);
        // console.log("USER ID:", req.user.user_id);
        const user_id = req.user.user_id;
        const profile = findTeacherProfileByUserId(user_id);

        if(!profile){
            return res.status(404).json({
                message : "Profile Not Found"
            });
        }
        return res.status(200).json(profile);

    }catch(error){
        console.error(error);

        return res.status(500).json({
            error : "internal server error"
        })
    }
}

function updateProfile(req,res){
    try{
        const user_id = req.user.user_id;
        const {bio , teachingmode} = req.body;

        if(!teachingmode){
            return res.status(400).json({
                message : "Teaching Mode is Required"
            });
        }

        const normalizedTeachingMode = teachingmode.toLowerCase();

        if(!["both","online","offline"].includes(normalizedTeachingMode)){
            return res.status(400).json({
                message: "Teaching mode must be offline, online , or both"
            });
        }

        const profile = findTeacherProfileByUserId(user_id);

        if(!profile){
            return res.status(404).json({
                message : "Profile Not Found!"
            });
        }

        updateTeacherProfile(user_id,bio,normalizedTeachingMode);

        const updatedProfile = findTeacherProfileByUserId(user_id);
        
        return res.status(200).json({
            message : "Profile Updated Successfully!",
            profile : updatedProfile
        });

    }catch(error){
        return res.status(500).json({
            message : "Internal Server Error"
        });
    }
}

function deleteProfile(req, res) {

    try {

        const user_id = req.user.user_id;

        if (req.user.role !== "teacher") {
            return res.status(403).json({
                message: "Only teachers can delete a teacher account"
            });
        }

        const profile = findTeacherProfileByUserId(user_id);

        if (!profile) {
            return res.status(404).json({
                message: "Profile Not Found!"
            });
        }

        deleteTeacherProfile(user_id);

        return res.status(200).json({
            message: "Teacher Account Deleted Successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {getProfile , updateProfile, deleteProfile}