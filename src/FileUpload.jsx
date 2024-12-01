'use client'
import React, { useState } from "react";
import "./FileUpload.css";
import fbx2gltf from 'fbx2gltf';

const FileUpload = () => {
	const [file, setFile] = useState(null);
	const [name, setName] = useState("");
	const [uploadStatus, setUploadStatus] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
	};

	const handleNameChange = (e) => {
		setName(e.target.value);
	};

	async function getPresignedUrl(name, file) {
		//const fileType = file.name.split(".").pop();
		const fileType = "gltf";
		const response = await fetch("/api/generate-upload-url", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, fileType }),
		});
		const { uploadUrl, fileName } = await response.json();
		return { uploadUrl, fileName };
	}

	async function uploadFileToS3(uploadUrl, file) {
		const fileType = file.name.split(".").pop();
		const response = await fetch(uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": fileType },
			body: file,
		});

		if (!response.ok) {
			throw new Error(`Upload failed: ${response.status}`);
		}
		return response;
	}

	async function triggerGitHubAction(modelName, fileUrl) {
		const response = await fetch("/api/trigger-github-action", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ modelName, fileName:fileUrl }),
		});

		if (!response.ok) {
			throw new Error("Failed to trigger GitHub Action");
		}
		return response.json();
	}

	async function uploadModel(file, modelName) {
		const { uploadUrl, fileName } = await getPresignedUrl(modelName, file);
		  const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload-fbx", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Error converting FBX to GLTF");
			}

			const { convertedFile } = await response.json();
			await uploadFileToS3(uploadUrl, convertedFile);
		return fileName;
	}

	// async function convertFBXFirst(file) {
	// 	 const fbxFilePath = `/tmp/${file.originalname}`;
	// 		fs.writeFileSync(fbxFilePath, file.buffer);
	// 		const gltfFilePath = `/tmp/${file.originalname}.gltf`;
	// 		try {
	// 			var gltfFile = await fbx2gltf(fbxFilePath, gltfFilePath);
	// 		} catch (conversionError) {
	// 			console.error("FBX to GLTF conversion failed:", conversionError);
	// 		}
	// 		return gltfFile;
	// }

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file || !name) {
			setUploadStatus("Please provide both a name and a file.");
			return;
		}

		setIsLoading(true);
		setUploadStatus("");
		try {
			const fileName = await uploadModel(file, name);
			setUploadStatus(
				"File uploaded successfully. Triggering GitHub Action..."
			);
			await triggerGitHubAction(name, fileName);
			setUploadStatus("Upload and Action triggered successfully!");
		} catch (error) {
			console.error("Error:", error);
			setUploadStatus("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div style={{ height: "100vh", backgroundColor: "rgb(61, 176, 124)" }}>
			<div className="upload-container">
				<h2 className="header">Upload FBX File</h2>
				<form onSubmit={handleSubmit} className="upload-form">
					<div className="input-group">
						<label htmlFor="name">Name:</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={handleNameChange}
							required
							className="input-field"
						/>
					</div>
					<div className="input-group">
						<label htmlFor="file">File:</label>
						<input
							type="file"
							id="file"
							accept=".fbx"
							onChange={handleFileChange}
							required
							className="input-field"
						/>
					</div>
					<button type="submit" className="submit-button" disabled={isLoading}>
						{isLoading ? "Uploading..." : "Upload"}
					</button>
				</form>
				{uploadStatus && <p className="status-message">{uploadStatus}</p>}
			</div>
		</div>
	);
};

export default FileUpload;
