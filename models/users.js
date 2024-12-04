import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	googleId: { type: String, required: true },
	email: { type: String, required: true },
	name: { type: String },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
