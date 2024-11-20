
module.exports = async (req, res) => {

    if (req.method === "OPTIONS") {
			res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins, or specify a domain
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
			res.setHeader(
				"Access-Control-Allow-Headers",
				"Content-Type, Authorization"
			); // Allowed headers
			return res.status(200).end();
		}
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { modelName, fileName } = req.body;

	if (!modelName || !fileName) {
		return res
			.status(400)
			.json({ error: "Model name and file URL are required." });
	}

	try {
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
        console.log(fileUrl);
		const response = await fetch(
			`https://api.github.com/repos/mayilvhnm17/ARObjectPlacement/actions/workflows/unity-addressables-build.yml/dispatches`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					ref: "main", // or the branch you want to trigger
					inputs: {
						modelName,
						fileUrl,
					},
				}),
			}
		);


		if (!response.ok) {
			throw new Error("Failed to trigger GitHub Action");
		}

		return res
			.status(200)
			.json({ message: "GitHub Action triggered successfully" });
	} catch (error) {
		console.error("Error triggering GitHub Action:", error);
		return res.status(500).json({ error: "Failed to trigger GitHub Action" });
	}
};
