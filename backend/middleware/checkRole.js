
// 🔹 Middleware to check user role
const checkRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = req.user
            // ✅ Check if the user's role is allowed
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Forbidden: You do not have access" });
            }

            next();
        } catch (error) {
            console.error("Role Check Error:", error);
            return res.status(500).json({ message: "Server error", error });
        }
    };
};

module.exports = checkRole;