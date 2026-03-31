import {BatchGetCommand, GetCommand, PutCommand} from "@aws-sdk/lib-dynamodb";
import {User} from "tweeter-shared";
import {AppConfig} from "../../config/AppConfig";
import {UserCredentialsRecord, UserDao} from "../interfaces/UserDao";
import {dynamoDocClient} from "./DynamoClient";
import {toUser, UserItem} from "./DynamoModelUtils";

export class DynamoUserDao implements UserDao {
	public async getUserByAlias(alias: string): Promise<User | null> {
		const output = await dynamoDocClient.send(
			new GetCommand({
				TableName: AppConfig.userTableName,
				Key: {alias},
			}),
		);

		const item = output.Item as UserItem | undefined;
		if (!item) {
			return null;
		}

		return toUser(item);
	}

	public async getUserCredentialsByAlias(alias: string): Promise<UserCredentialsRecord | null> {
		const output = await dynamoDocClient.send(
			new GetCommand({
				TableName: AppConfig.userTableName,
				Key: {alias},
			}),
		);

		const item = output.Item as UserItem | undefined;
		if (!item || !item.password_hash) {
			return null;
		}

		return {
			user: toUser(item),
			passwordHash: item.password_hash,
		};
	}

	public async putUser(user: User, passwordHash: string): Promise<void> {
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
				ConditionExpression: "attribute_not_exists(alias)",
			}),
		);
	}

	public async getUsersByAliases(aliases: string[]): Promise<User[]> {
		if (aliases.length === 0) {
			return [];
		}

		const uniqueAliases = Array.from(new Set(aliases));
		const output = await dynamoDocClient.send(
			new BatchGetCommand({
				RequestItems: {
					[AppConfig.userTableName]: {
						Keys: uniqueAliases.map((alias) => ({alias})),
					},
				},
			}),
		);

		const items = (output.Responses?.[AppConfig.userTableName] ?? []) as UserItem[];
		const byAlias = new Map<string, User>();
		for (const item of items) {
			byAlias.set(item.alias, toUser(item));
		}

		return aliases.map((alias) => byAlias.get(alias)).filter((user): user is User => user !== undefined);
	}
}
