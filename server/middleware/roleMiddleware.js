
const VALID_ROLES = ["manager", "admin", "contractor"];

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Authentication required",
                });
            }

            const currentRole = req.user.role;

            // Reject unknown or legacy roles, including "user".
            if (!VALID_ROLES.includes(currentRole)) {
                return res.status(403).json({
                    message: "Your account role is not authorized",
                });
            }

            // Check whether this role is allowed for the route.
            if (!allowedRoles.includes(currentRole)) {
                return res.status(403).json({
                    message: "You do not have permission to perform this action",
                });
            }

            return next();
        } catch (error) {
            console.error("Role middleware error:", error);

            return res.status(500).json({
                message: "Authorization service error",
            });
        }
    };
};

module.exports = roleMiddleware;
