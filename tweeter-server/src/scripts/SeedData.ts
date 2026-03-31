import bcrypt from "bcryptjs";
import {BatchWriteCommand, PutCommand} from "@aws-sdk/lib-dynamodb";
import {AppConfig} from "../config/AppConfig";
import {dynamoDocClient} from "../dao/dynamodb/DynamoClient";

const CHUNK_SIZE = 25;
const DEFAULT_PASSWORD = "password123";

type SeedUser = {
	alias: string;
	firstName: string;
	lastName: string;
	imageUrl: string;
};

const buildSeedUsers = (): SeedUser[] => {
	const users: SeedUser[] = [];
	users.push({
		alias: "@seed_author",
		firstName: "Seed",
		lastName: "Author",
		imageUrl: "https://placehold.co/128x128/png",
	});

	for (let i = 1; i <= 15; i += 1) {
		users.push({
			alias: `@seed_user_${i}`,
			firstName: `Seed${i}`,
			lastName: "Follower",
			imageUrl: "https://placehold.co/128x128/png",
		});
	}

	return users;
};

const chunk = <T>(items: T[], chunkSize: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += chunkSize) {
		chunks.push(items.slice(i, i + chunkSize));
	}

	return chunks;
};

const putUsers = async (users: SeedUser[], passwordHash: string): Promise<void> => {
	for (const user of users) {
		await dynamoDocClient.send(
			new PutCommand({
				TableName: AppConfig.userTableName,
				Item: {
					alias: user.alias,
					first_name: user.firstName,
					last_name: user.lastName,
					image_url: user.imageUrl,
					password_hash: passwordHash,
				},
			}),
		);
	}
};

const putFollows = async (users: SeedUser[]): Promise<void> => {
	const authorAlias = "@seed_author";
	const followers = users.filter((user) => user.alias !== authorAlias);
	const followItems: Array<{follower_alias: string; followee_alias: string}> = [];

	for (const follower of followers) {
		followItems.push({follower_alias: follower.alias, followee_alias: authorAlias});
	}

	for (let i = 1; i <= 12; i += 1) {
		followItems.push({follower_alias: authorAlias, followee_alias: `@seed_user_${i}`});
	}

	for (const followChunk of chunk(followItems, CHUNK_SIZE)) {
		await dynamoDocClient.send(
			new BatchWriteCommand({
				RequestItems: {
					[AppConfig.followTableName]: followChunk.map((follow) => ({
						PutRequest: {
							Item: follow,
						},
					})),
				},
			}),
		);
	}
};

const putStatusesAndFeed = async (): Promise<void> => {
	const authorAlias = "@seed_author";
	const followers = Array.from({length: 15}, (_, i) => `@seed_user_${i + 1}`);
	const now = Date.now();

	for (let i = 0; i < 15; i += 1) {
		const timestamp = now - i * 60_000;
		const createdAt = timestamp.toString().padStart(13, "0");
		const post = `Seed status #${i + 1} at ${new Date(timestamp).toISOString()}`;

		await dynamoDocClient.send(
			new PutCommand({
				TableName: AppConfig.statusTableName,
				Item: {
					author_alias: authorAlias,
					created_at: createdAt,
					post,
					author_first_name: "Seed",
					author_last_name: "Author",
					author_image_url: "https://placehold.co/128x128/png",
					timestamp,
				},
			}),
		);

		const feedRequests = followers.map((recipientAlias) => ({
			PutRequest: {
				Item: {
					recipient_alias: recipientAlias,
					originator_alias: authorAlias,
					created_at: createdAt,
					post,
					author_alias: authorAlias,
					author_first_name: "Seed",
					author_last_name: "Author",
					author_image_url: "https://placehold.co/128x128/png",
					timestamp,
				},
			},
		}));

		for (const requestChunk of chunk(feedRequests, CHUNK_SIZE)) {
			await dynamoDocClient.send(
				new BatchWriteCommand({
					RequestItems: {
						[AppConfig.feedTableName]: requestChunk,
					},
				}),
			);
		}
	}
};

const seed = async (): Promise<void> => {
	const users = buildSeedUsers();
	const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

	await putUsers(users, passwordHash);
	await putFollows(users);
	await putStatusesAndFeed();

	console.log("Seed data applied successfully");
};

seed().catch((error: unknown) => {
	console.error("Failed to seed data", error);
	process.exit(1);
});
