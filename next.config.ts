import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const repoName = "lds-tools";

const nextConfig: NextConfig = {
	output: isProd ? "export" : undefined,
	basePath: isProd ? `/${repoName}` : "",
	env: {
		NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : "",
	},
};

export default nextConfig;
