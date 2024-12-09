import { connectToDatabase } from "../../utils/database";
import User from "../../models/users";
import { generateToken } from "../../utils/authenticate";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { accessToken } = req.body;

	if (!accessToken) {
		return res.status(400).json({ error: "Access token is required" });
	}

	try {
		await connectToDatabase();
		console.log(req.body);

		// Verify Access Token using Google's Tokeninfo API
		const userInfoResponse = await fetch(
			"https://www.googleapis.com/oauth2/v1/userinfo",
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (!userInfoResponse.ok) {
			throw new Error(
				`Failed to fetch user info: ${userInfoResponse.statusText}`
			);
		}

		const userInfoData = await userInfoResponse.json();
		const { id: googleId, email, name } = userInfoData;

		// Now you can use googleId, email, and name in your logic.

		// Find or create user
		let user = await User.findOne({ googleId });
		if (!user) {
			user = new User({ googleId, email, name });
			await user.save();
		}

		// Generate your app's JWT token
		const token = generateToken(user);

		res.status(200).json({ message: "Login successful", user, token });
	} catch (error) {
		console.error(
			"Error during Google login:",
			error.response?.data || error.message
		);
		res.status(500).json({ error: "Internal server error" });
	}
}
