import mongoose from "mongoose";

const accessTokenSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	accessToken: { type: String },
});

export default mongoose.models.AccessToken ||
	mongoose.model("AccessToken", accessTokenSchema);
