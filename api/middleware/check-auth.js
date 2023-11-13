//for protected our Routes
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();


module.exports = (req,res,next)=>{
    try{
        // verify a token symmetric - synchronous
        const token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token ,process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch(err) {
        return res.status(401).json({
            message : "Auth Failed Try Again"
        })
    }
}