const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const BlockedToken = require("../models/blockToken.model");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Get token from cookies
    console.log(token)
    if (!token) return res.status(401).json({ message: "Unauthorized, Access Denied" });

    if (await BlockedToken.findOne({token})){
        return res.status(401).json({ message: "Unauthorized, Access Denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    req.user = user
    
    next();
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: "Invalid Token", error });
  }
};

module.exports = authMiddleware;
