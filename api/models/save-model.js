import { connectToDatabase } from "../../utils/database";

import { authenticateUser } from "../../utils/authenticate";
import Model from "../../models/model";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { name, fileUrl } = req.body;
	const token = req.headers.authorization?.split(" ")[1]; // Extract the Bearer token

	try {
		// Verify the user's access token
		const user = authenticateUser(token);
		if (!user) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		await connectToDatabase();

		// Save the model metadata in the database
		const newModel = new Model({
			name,
			fileUrl,
			userId: user._id, // Associate the model with the user
		});

		await newModel.save();

		res
			.status(201)
			.json({ message: "Model saved successfully", model: newModel });
	} catch (error) {
		console.error("Error saving model:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
