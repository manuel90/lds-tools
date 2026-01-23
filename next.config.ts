import type { NextConfig } from "next";

//import path from "path";

const isProd = process.env.NODE_ENV === "production";

const repoName = "lds-tools";

const nextConfig: NextConfig = {
	//output: "export",
	basePath: isProd ? `/${repoName}` : "",
	// sassOptions: {
	//   //includePaths: ["./src"],
	//   includePaths: [path.join(__dirname, "styles")], // Optional: Add your styles directory to include paths
	//   prependData: `@import "./src/styles/variables";`, // Adjust the path to your variables file
	// },
	env: {
		// We export this so we can use it in our fetch calls
		NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : "",
	},
};

export default nextConfig;
