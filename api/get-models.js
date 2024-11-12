const AWS = require("aws-sdk");

// AWS SDK configuration
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

module.exports = async (req, res) => {
	if (req.method === "GET") {
		return getModels(req, res);
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
};

// Function to retrieve the list of models from S3
async function getModels(req, res) {
	try {
		const params = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Prefix: "uploads/",
		};

		const s3Objects = await s3.listObjectsV2(params).promise();

		const models = await Promise.all(
			s3Objects.Contents.map(async (object) => {
				const metadata = await s3
					.headObject({
						Bucket: process.env.AWS_BUCKET_NAME,
						Key: object.Key,
					})
					.promise();

				return {
					name: metadata.Metadata.modelname, // Model name from S3 metadata
					url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${object.Key}`,
				};
			})
		);

		res.status(200).json({ models });
	} catch (error) {
		console.error("Failed to retrieve models:", error);
		res.status(500).json({ error: "Failed to retrieve models." });
	}
}
