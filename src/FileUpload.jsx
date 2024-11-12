import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";


const FileUpload = () => {
	const [file, setFile] = useState(null);
	const [name, setName] = useState("");
	const [uploadStatus, setUploadStatus] = useState("");
	const [isLoading, setIsLoading] = useState(false); // Loading state

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
	};

	const handleNameChange = (e) => {
		setName(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!file || !name) {
			setUploadStatus("Please provide both a name and a file.");
			return;
		}

		const formData = new FormData();
		formData.append("fbxFile", file);
		formData.append("name", name);

		setIsLoading(true); // Start loading
		setUploadStatus("");
		try {
			const response = await axios.post(
				"https://arvercelapp.vercel.app//upload-model",
				formData,
				{
					headers: { "Content-Type": "multipart/form-data" },
				}
			);
			setUploadStatus("Upload successful!");
		} catch (error) {
			console.error("Error uploading file:", error);
			setUploadStatus("Upload failed. Please try again.");
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	return (
		<div style={{ height:'100vh',backgroundColor: "rgb(61, 176, 124)" }}>
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
				{isLoading && (
					<p className="status-message loading">Uploading, please wait...</p>
				)}
				{uploadStatus && <p className="status-message">{uploadStatus}</p>}
			</div>
		</div>
	);
};

export default FileUpload;
