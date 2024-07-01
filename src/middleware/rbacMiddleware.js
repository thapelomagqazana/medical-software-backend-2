const { roles } = require("../config/roles");

const grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            const role = req.user.role;
            const permissions = roles[role];

            if (!permissions.includes(action)){
                return res.status(403).json({ message: "Unauthorized" });
            }

            next();
        } catch (error) {
            console.error("RBAC Middleware Error:", error.message);
            return res.status(500).json({ message: "Server Error" });
        }
    };
};

module.exports = { grantAccess };