import {DeleteCommand, GetCommand, PutCommand} from "@aws-sdk/lib-dynamodb";
import {AuthToken} from "tweeter-shared";
import {AppConfig} from "../../config/AppConfig";
import {AuthTokenDao} from "../interfaces/AuthTokenDao";
import {dynamoDocClient} from "./DynamoClient";

type AuthTokenItem = {
	token: string;
	alias: string;
	issued_at: number;
	expires_at: number;
};

export class DynamoAuthTokenDao implements AuthTokenDao {
	public async createAuthToken(alias: string): Promise<AuthToken> {
		const authToken = AuthToken.Generate();
		const nowSeconds = Math.floor(Date.now() / 1000);
		const expiresAt = nowSeconds + AppConfig.authTokenTtlSeconds;

		await dynamoDocClient.send(
			new PutCommand({
				TableName: AppConfig.authTokenTableName,
				Item: {
					token: authToken.token,
					alias,
					issued_at: authToken.timestamp,
					expires_at: expiresAt,
				},
			}),
		);

		return authToken;
	}

	public async validateAuthToken(token: string): Promise<string | null> {
		const output = await dynamoDocClient.send(
			new GetCommand({
				TableName: AppConfig.authTokenTableName,
				Key: {token},
			}),
		);

		const item = output.Item as AuthTokenItem | undefined;
		if (!item) {
			return null;
		}

		const nowSeconds = Math.floor(Date.now() / 1000);
		if (item.expires_at <= nowSeconds) {
			return null;
		}

		return item.alias;
	}

	public async deleteAuthToken(token: string): Promise<void> {
		await dynamoDocClient.send(
			new DeleteCommand({
				TableName: AppConfig.authTokenTableName,
				Key: {token},
			}),
		);
	}
}
