const AWS = require("aws-sdk");
const uuid = require("uuid").v4;

// AWS SDK configuration
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

module.exports = async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { name, fileType } = req.body; // Expect `name` and `fileType` in request body

	if (!name || !fileType) {
		return res
			.status(400)
			.json({ error: "Model name and file type are required." });
	}

	try {
		const fileExtension = fileType.split("/")[1]; // Derive extension from MIME type
		const fileName = `${uuid()}.${fileExtension}`; // Unique filename
		const s3Params = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: `uploads/${fileName}`,
			Expires: 300, // URL validity: 5 minutes
			ContentType: fileType,
			ACL: "public-read",
			Metadata: { modelName: name },
		};

		// Generate a pre-signed URL
		const uploadUrl = s3.getSignedUrl("putObject", s3Params);

		return res.status(200).json({ uploadUrl, fileName });
	} catch (error) {
		console.error("Error generating pre-signed URL:", error);
		return res
			.status(500)
			.json({ error: "Could not generate pre-signed URL." });
	}
};
