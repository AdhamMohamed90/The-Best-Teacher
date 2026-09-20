const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const usermodel = require("../models/user.model");
const teachermodel = require("../models/teacher.model");
const {transaction} = require("../utils/transaction");

function register(req,res){
    try{
        const {name, email, password, role, teachingmode, bio} = req.body;

        if(!name || !email || !password || !role){
            return res.status(400).json({
                message : "All fields are required"
            })
        };
        let normalizedRole = role.toLowerCase();

        if(normalizedRole !== "student" && normalizedRole !== "teacher"){
            return res.status(400).json({
                message : "Role Must be student or teacher!"
            })
        };

        let normalizedTeachingMode = null;
        
        if(normalizedRole === "teacher"){
            if(!teachingmode){
                return res.status(400).json({
                    message : "Teaching mode is required!"
                })}
                normalizedTeachingMode = teachingmode.toLowerCase();

            if (
                !["both","online","offline"].includes(normalizedTeachingMode)
            ){
                return res.status(400).json({
                    message : "Teaching Mode must be both , offline or online"
                })}
        }
        const result = transaction(()=>{
            const existingUser = usermodel.findUserByEmail(email);

            if(existingUser){
                return res.status(400).json({
                    message : "This user already exist!"
                })
            };

            const hashedPassword = bcrypt.hashSync(password,10);

            const result = usermodel.createUser(name,email,hashedPassword,normalizedRole)

            if (normalizedRole === "teacher"){
                teachermodel.createTeacherProfile(result.lastInsertRowid,bio,normalizedTeachingMode)

            }
            return res.status(200).json({
                    message : "User registerd Successfully",
                    userId : Number(result.lastInsertRowid)
                })
        })
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
             message : "Internal Server Error"
        });
    }
}

function login(req,res){
    try{
        const {email,password} = req.body;
        
        if (!email || !password){
            return res.status(400).json({
                message : "Email and Password are Required!"
            });
        }

        const user = usermodel.findUserByEmail(email);

        if(!user){
            return res.status(400).json({
                message : "Invalid Email or Password!"
            });
        }

        const passwordMatch = bcrypt.compareSync(password, user.password);

        if(!passwordMatch){
            return res.status(400).json({
                message : "Invalid Email or Password!"
            })
        }

        const token = jwt.sign({
            user_id : user.id,
            name : user.name,
            role : user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn : "1h"
        }
        );

        return res.status(200).json({
            message : "Login Successful",
            token
        });


    }catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Internal Server Error"
        })
    }
}

module.exports = {
    register,
    login
};
