import mongoose from "mongoose";

const modelSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		fileUrl: { type: String, required: true },
		 userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, // Reference to the user who uploaded the model
	},
	{ timestamps: true }
);

const Model = mongoose.models.Model || mongoose.model("Model", modelSchema);
export default Model;
