import { OAuth2Client } from "google-auth-library";
import { connectToDatabase } from "../../utils/database";
import User from "../../models/users";
import {generateToken} from "../../utils/authenticate";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { tokenId } = req.body;

	try {
		await connectToDatabase();
		console.log(req.body);
		// Verify Google token
		const ticket = await client.verifyIdToken({
			idToken: tokenId,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const { sub: googleId, email, name } = ticket.getPayload();

		// Find or create user
		let user = await User.findOne({ googleId });
		if (!user) {
			user = new User({ googleId, email, name });
			await user.save();
		}

		const token = generateToken(user);
		res.status(200).json({ message: "Login successful", user, token });

	} catch (error) {
		console.error("Error during Google login:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
