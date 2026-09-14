const jwt = require("jsonwebtoken");

function authMiddleware(req,res,next){
    try{
        const authHeader = req.headers.authorization;
        // console.log("ALL HEADERS:", req.headers);
        // console.log("AUTH HEADER:", authHeader);

        if(!authHeader){
            return res.status(401).json({
                message : "Acces token is required"
            });
        }
        const parts = authHeader.split(" ");

        if(parts.length !== 2 || parts[0] !== "Bearer"){
            return res.status(401).json({
                message : "Invalid Authorization Method"
            })
        }

        const token = parts[1];

        const decoded = jwt.verify( 
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        console.log("REQ.USER IN MIDDLEWARE:", req.user);
        
        next();

    }catch(error){
        return res.status(401).json({
            message : "Invalid or expired token"
        })
    }
}

module.exports = {authMiddleware};