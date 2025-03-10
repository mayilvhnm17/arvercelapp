import React, { useState } from "react";
import "./FileUpload.css";

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
		const fileType = file.name.split(".").pop();
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

	async function uploadModel(file, modelName) {
		const { uploadUrl, fileName } = await getPresignedUrl(modelName, file);
		await uploadFileToS3(uploadUrl, file);
		return uploadUrl.split(/[?#]/)[0];
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file || !name) {
			setUploadStatus("Please provide both a name and a file.");
			return;
		}

		setIsLoading(true);
		setUploadStatus("");
		try {
			const uploadUrl = await uploadModel(file, name);

			const response = await fetch("/api/models/save-model", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
				},
				body: JSON.stringify({
					name,
					fileUrl: uploadUrl,
				}),
			});

				if (!response.ok) {
					throw new Error("Failed to save model metadata");
				}

				const data = await response.json();
			setUploadStatus(
				"File uploaded successfully."
			);
			//await triggerGitHubAction(name, fileName);
			setUploadStatus("Uploaded successfully!");
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
				<h2 className="header">Upload GLTF File</h2>
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
							accept=".gltf"
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
