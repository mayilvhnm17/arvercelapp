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

	async function getPresignedUrl(name, file) {
		const fileType = file.name.split(".").pop();

		// Request pre-signed URL
		const response = await fetch("/api/generate-upload-url", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, fileType }),
		});
		const { uploadUrl, fileName } = await response.json();

		return { uploadUrl, fileName };
	}

	async function uploadFileToS3(uploadUrl, file) {
		try{
		const response = await fetch(uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": file.mimetype },
			body: file,
		});
		 if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
	}

	async function uploadModel(file, modelName) {
		const { uploadUrl, fileName } = await getPresignedUrl(modelName, file);

		const success = await uploadFileToS3(uploadUrl, file);
		if (success) {
			console.log("File uploaded successfully:", fileName);
			//setUploadStatus("Upload successful!");
			return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
			
		} else {
			setUploadStatus("Upload failed. Please try again.");
			console.error("File upload failed.");
			return null;
		}
		
	}




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
			// const response = await axios.post(
			// 	"https://arvercelapp.vercel.app/api/upload-model",
			// 	formData,
			// 	{
			// 		headers: { "Content-Type": "multipart/form-data" },
			// 	}
			// );
			uploadModel(file,name);
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
