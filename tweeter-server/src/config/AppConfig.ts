const getEnv = (name: string, defaultValue?: string): string => {
	const value = process.env[name];
	if (value && value.length > 0) {
		return value;
	}

	if (defaultValue !== undefined) {
		return defaultValue;
	}

	throw new Error(`internal-server-error: missing required environment variable '${name}'`);
};

const getEnvNumber = (name: string, defaultValue: number): number => {
	const rawValue = process.env[name];
	if (!rawValue) {
		return defaultValue;
	}

	const parsed = Number(rawValue);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		throw new Error(`internal-server-error: invalid numeric environment variable '${name}'`);
	}

	return parsed;
};

export const AppConfig = {
	region: getEnv("AWS_REGION", "us-east-1"),
	userTableName: getEnv("USER_TABLE_NAME", "tweeter-user"),
	authTokenTableName: getEnv("AUTH_TOKEN_TABLE_NAME", "tweeter-auth-token"),
	followTableName: getEnv("FOLLOW_TABLE_NAME", "tweeter-follow"),
	statusTableName: getEnv("STATUS_TABLE_NAME", "tweeter-status"),
	feedTableName: getEnv("FEED_TABLE_NAME", "tweeter-feed"),
	userImageBucketName: getEnv("USER_IMAGE_BUCKET_NAME", "tweeter-user-images"),
	authTokenTtlSeconds: getEnvNumber("AUTH_TOKEN_TTL_SECONDS", 60 * 60),
};
