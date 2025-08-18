const jwt = require("jsonwebtoken");

exports.authToken = async (req, res, next) => {
    const { authentication } = req.headers;
    if (!authentication) {
        return res.status(401).json("Please log in ");
    }
    try {
        const verify = await jwt.verify(authentication, process.env.JWT_TOKEN)
        
        if (!verify) {
            return res.status(401).json("You are not verified");
        }else{
        req.user = verify;
        next();
        }
    } catch (err) {
        res.status(400).json(err)

    }

}