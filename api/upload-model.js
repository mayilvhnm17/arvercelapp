// /api/upload-model.js
const AWS = require("aws-sdk");
const multer = require("multer");
const uuid = require("uuid").v4;

// AWS SDK configuration
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("fbxFile");

module.exports = (req, res) => {
	upload(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ error: "Error uploading file" });
		}

		const { name } = req.body;
		const fbxFile = req.file;

		if (!name || !fbxFile) {
			return res
				.status(400)
				.json({ error: "Model name and FBX file are required." });
		}

		const fileExtension = fbxFile.originalname.split(".").pop();
		const fileName = `${uuid()}.${fileExtension}`;

		const s3Params = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: `uploads/${fileName}`,
			Body: fbxFile.buffer,
			ContentType: fbxFile.mimetype,
			ACL: "public-read",
			Metadata: { modelName: name },
		};

		try {
			const uploadResult = await s3.upload(s3Params).promise();
			const fileUrl = uploadResult.Location;
			return res
				.status(200)
				.json({ message: "Model uploaded successfully", url: fileUrl });
		} catch (error) {
			console.error("Upload failed:", error);
			return res.status(500).json({ error: "Failed to upload model." });
		}
	});
};
