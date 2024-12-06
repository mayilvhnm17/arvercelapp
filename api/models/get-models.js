
import Model from "../../models/model";
import { authenticateUser } from "../../utils/authenticate";
import { connectToDatabase } from "../../utils/database";

// const AWS = require("aws-sdk");

// // AWS SDK configuration
// AWS.config.update({
// 	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// 	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// 	region: process.env.AWS_REGION,
// });

// const s3 = new AWS.S3();

module.exports = async (req, res) => {
	// if (req.method === "OPTIONS") {
	// 	res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins, or specify a domain
	// 	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
	// 	res.setHeader(
	// 		"Access-Control-Allow-Headers",
	// 		"Content-Type, Authorization"
	// 	); // Allowed headers
	// 	return res.status(200).end();
	// }
	if (req.method === "GET") {
		return getModels(req, res);
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
};

const getModels = async (req, res) => {
	const token = req.headers.authorization?.split(" ")[1];
	try {
		// Retrieve the authenticated user's ID from the request (added by verifyToken middleware)
		const user = authenticateUser(token);
		console.log(JSON.stringify(user));
		if (!user) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		await connectToDatabase();

		let userId = user.userId; 
		// Find models where userId matches the authenticated user's ID
		const models = await Model.find({ userId }).select("name fileUrl -_id"); // Select 'name' and 'url' fields only

		// Send the retrieved models in the response
		res.status(200).json({ models });
	} catch (error) {
		console.error("Error retrieving models:", error);
		res.status(500).json({ error: "Error retrieving models" });
	}
};


// // Function to retrieve the list of models from S3
// async function getModelss(req, res) {
// 	try {
// 		const params = {
// 			Bucket: process.env.AWS_BUCKET_NAME,
// 			Prefix: "uploads/",
// 		};

// 		const s3Objects = await s3.listObjectsV2(params).promise();

// 		const models = await Promise.all(
// 			s3Objects.Contents.map(async (object) => {
// 				const metadata = await s3
// 					.headObject({
// 						Bucket: process.env.AWS_BUCKET_NAME,
// 						Key: object.Key,
// 					})
// 					.promise();

// 				return {
// 					name: metadata.Metadata.modelname, // Model name from S3 metadata
// 					url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${object.Key}`,
// 				};
// 			})
// 		);

// 		res.status(200).json({ models });
// 	} catch (error) {
// 		console.error("Failed to retrieve models:", error);
// 		res.status(500).json({ error: "Failed to retrieve models." });
// 	}
// }
