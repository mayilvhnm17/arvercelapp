import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT and extract user data.
 */
export const authenticateUser = (token) => {
	//const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		throw new Error("No token provided");
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return decoded; // Returns user data embedded in the token
	} catch (error) {
		throw new Error("Invalid or expired token");
	}
};

/**
 * Generate a JWT for a user
 */
export const generateToken = (user) => {
	return jwt.sign(
		{ userId: user._id, email: user.email },
		process.env.JWT_SECRET,
		{ expiresIn: "7d" } // Token validity (adjust as needed)
	);
};
