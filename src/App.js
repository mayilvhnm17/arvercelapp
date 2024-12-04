import React, {  } from "react";
import {
	Route,
	Routes,
	Link} from "react-router-dom";

import { useSelector } from "react-redux";
import "./App.css";
import FileUpload from "./layout/fileupload/FileUpload";
import HomePage from "./HomePage"; // A simple home page before login
import GoogleLoginLayout from "./layout/login/GoogleLogin";

function App() {

	 const accessToken = useSelector((state) => state.accessToken);
	// const navigate = useNavigate(); // For programmatic navigation
	


	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<GoogleLoginLayout/>} />
				{/* File Upload page route */}
			<Route
				path="/fileupload"
				element={
					accessToken ? (
						<FileUpload />
					) : (
						<div>
							<h3>You must be logged in to upload files</h3>
							<Link to="/login">Login</Link>
						</div>
					)
				}
			/>
			</Routes>
		</div>		
	);
}

export default App;
