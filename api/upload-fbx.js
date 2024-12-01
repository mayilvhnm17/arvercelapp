import { promises as fs } from "fs";
import AWS from "aws-sdk";
import { execFile } from "child_process";
import path from "path";
import multer from "multer";
import * as fileType from 'file-type';

const s3 = new AWS.S3();
const upload = multer({ storage: multer.memoryStorage() }).single("file");

// Function to convert FBX to GLTF
const convertFBXToGLTF = (inputBuffer, outputPath) => {
	return new Promise((resolve, reject) => {
		const tempInputPath = path.join("/tmp", "input.fbx");
		const tempOutputPath = outputPath;

		// Write the FBX file to disk
		fs.writeFile(tempInputPath, inputBuffer).then(() => {
			execFile(
				"fbx2gltf",
				[tempInputPath, "-o", tempOutputPath],
				(err, stdout, stderr) => {
					if (err) {
						reject(`Conversion failed: ${stderr}`);
					} else {
						resolve(tempOutputPath);
					}
				}
			);
		});
	});
};

// Body->
//file=file
// fileName=fileName
// fileType=fileType
// Main API handler
export default function handler(req, res) {
	if (req.method === "POST") {
		// Use Multer to process the file
		upload(req, res, async (err) => {
			if (err) {
				res.status(400).json({ error: "File upload failed" });
				return;
			}

			try {
				// Convert FBX to GLTF
				const convertedFilePath = `/tmp/${req.file.originalname}.gltf`;
				await convertFBXToGLTF(req.file.buffer, convertedFilePath);

				// Read the GLTF file into memory
				const convertedFile = await fs.readFile(convertedFilePath);

				// Upload the converted GLTF file to S3
				const s3Params = {
					Bucket: process.env.S3_BUCKET_NAME,
					Key: `${req.body.fileName}.gltf`,
					Body: convertedFile,
					ContentType: req.body.fileType,
					ACL: "public-read",
					Metadata: { modelName: req.body.fileName },
				};

				const s3Response = await s3.upload(s3Params).promise();

				res.status(200).json({ convertedFile: s3Response.Location });
			} catch (error) {
				console.error("Error processing file:", error);
				res.status(500).json({ error: "Server error during file processing" });
			}
		});
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
