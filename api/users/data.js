import jwt from "jsonwebtoken";
import { connectToDatabase } from "../../utils/db";
import User from "../../models/user";

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		await connectToDatabase();

		// Verify JWT
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({ message: "User data retrieved successfully", user });
	} catch (error) {
		console.error("Error fetching user data:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
