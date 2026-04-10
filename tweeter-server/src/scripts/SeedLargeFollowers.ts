import bcrypt from "bcryptjs";
import {BatchWriteCommand} from "@aws-sdk/lib-dynamodb";
import {AppConfig} from "../config/AppConfig";
import {dynamoDocClient} from "../dao/dynamodb/DynamoClient";

const DYNAMO_BATCH_SIZE = 25;
const DEFAULT_FOLLOWER_COUNT = 10_000;
const DEFAULT_PASSWORD = "password123";
const DEFAULT_TARGET_ALIAS = "@load_test_author";
const DEFAULT_FOLLOWER_ALIAS_PREFIX = "@load_follower_";
const DEFAULT_IMAGE_URL = "https://placehold.co/128x128/png";

type SeedOptions = {
	followerCount: number;
	targetAlias: string;
	followerAliasPrefix: string;
};

type UserItem = {
	alias: string;
	first_name: string;
	last_name: string;
	image_url: string;
	password_hash: string;
	follower_count: number;
	followee_count: number;
};

type FollowItem = {
	follower_alias: string;
	followee_alias: string;
};

const parseOptions = (): SeedOptions => {
	const args = process.argv.slice(2);

	let followerCount = DEFAULT_FOLLOWER_COUNT;
	let targetAlias = DEFAULT_TARGET_ALIAS;
	let followerAliasPrefix = DEFAULT_FOLLOWER_ALIAS_PREFIX;

	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (arg === "--followers") {
			const rawCount = args[i + 1];
			if (!rawCount) {
				throw new Error("bad-request: --followers requires a value");
			}

			const parsedCount = Number(rawCount);
			if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
				throw new Error("bad-request: --followers must be a positive integer");
			}

			followerCount = parsedCount;
			i += 1;
		} else if (arg === "--target") {
			const rawAlias = args[i + 1];
			if (!rawAlias) {
				throw new Error("bad-request: --target requires a value");
			}

			targetAlias = rawAlias;
			i += 1;
		} else if (arg === "--prefix") {
			const rawPrefix = args[i + 1];
			if (!rawPrefix) {
				throw new Error("bad-request: --prefix requires a value");
			}

			followerAliasPrefix = rawPrefix;
			i += 1;
		}
	}

	if (!targetAlias.startsWith("@")) {
		throw new Error("bad-request: --target alias must start with '@'");
	}

	if (!followerAliasPrefix.startsWith("@")) {
		throw new Error("bad-request: --prefix must start with '@'");
	}

	return {
		followerCount,
		targetAlias,
		followerAliasPrefix,
	};
};

const chunk = <T>(items: T[], size: number): T[][] => {
	const results: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		results.push(items.slice(i, i + size));
	}
	return results;
};

const batchWriteWithRetries = async (
	tableName: string,
	putItems: Array<Record<string, unknown>>,
): Promise<void> => {
	let unprocessed: Array<{PutRequest: {Item: Record<string, unknown>}}> = putItems.map((item) => ({
		PutRequest: {Item: item},
	}));

	while (unprocessed.length > 0) {
		const output = await dynamoDocClient.send(
			new BatchWriteCommand({
				RequestItems: {
					[tableName]: unprocessed,
				},
			}),
		);

		const returnedUnprocessed = output.UnprocessedItems?.[tableName] ?? [];
		unprocessed = returnedUnprocessed.flatMap((request) => {
			const item = request.PutRequest?.Item;
			if (!item) {
				return [];
			}

			return [{
				PutRequest: {
					Item: item as Record<string, unknown>,
				},
			}];
		});
		if (unprocessed.length > 0) {
			await new Promise((resolve) => setTimeout(resolve, 250));
		}
	}
};

const buildUserItems = (options: SeedOptions, passwordHash: string): UserItem[] => {
	const users: UserItem[] = [
		{
			alias: options.targetAlias,
			first_name: "Load",
			last_name: "Author",
			image_url: DEFAULT_IMAGE_URL,
			password_hash: passwordHash,
			follower_count: options.followerCount,
			followee_count: 0,
		},
	];

	for (let i = 1; i <= options.followerCount; i += 1) {
		users.push({
			alias: `${options.followerAliasPrefix}${i}`,
			first_name: `Follower${i}`,
			last_name: "Load",
			image_url: DEFAULT_IMAGE_URL,
			password_hash: passwordHash,
			follower_count: 0,
			followee_count: 1,
		});
	}

	return users;
};

const buildFollowItems = (options: SeedOptions): FollowItem[] => {
	const follows: FollowItem[] = [];
	for (let i = 1; i <= options.followerCount; i += 1) {
		follows.push({
			follower_alias: `${options.followerAliasPrefix}${i}`,
			followee_alias: options.targetAlias,
		});
	}
	return follows;
};

const seedLargeFollowers = async (): Promise<void> => {
	const options = parseOptions();
	console.log(`Seeding ${options.followerCount.toLocaleString()} followers for ${options.targetAlias}`);

	const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
	const users = buildUserItems(options, passwordHash);
	const follows = buildFollowItems(options);

	for (const userChunk of chunk(users, DYNAMO_BATCH_SIZE)) {
		await batchWriteWithRetries(AppConfig.userTableName, userChunk);
	}

	for (const followChunk of chunk(follows, DYNAMO_BATCH_SIZE)) {
		await batchWriteWithRetries(AppConfig.followTableName, followChunk);
	}

	console.log("Large follower seed completed successfully");
	console.log(`Target alias: ${options.targetAlias}`);
	console.log(`Follower count seeded: ${options.followerCount.toLocaleString()}`);
};

seedLargeFollowers().catch((error: unknown) => {
	console.error("Failed to seed large follower dataset", error);
	process.exit(1);
});
