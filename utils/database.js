import mongoose from "mongoose";

let isConnected = false; // Tracks connection state

export const connectToDatabase = async () => {
	if (isConnected) return;

	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		isConnected = true;
		console.log("Connected to MongoDB");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		throw new Error("Database connection failed");
	}
};
