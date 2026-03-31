import {DeleteCommand, GetCommand, PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import {AppConfig} from "../../config/AppConfig";
import {FollowDao} from "../interfaces/FollowDao";
import {dynamoDocClient} from "./DynamoClient";

type FollowItem = {
	follower_alias: string;
	followee_alias: string;
};

export class DynamoFollowDao implements FollowDao {
	public async isFollower(followerAlias: string, followeeAlias: string): Promise<boolean> {
		const output = await dynamoDocClient.send(
			new GetCommand({
				TableName: AppConfig.followTableName,
				Key: {
					follower_alias: followerAlias,
					followee_alias: followeeAlias,
				},
				ProjectionExpression: "follower_alias",
			}),
		);

		return output.Item !== undefined;
	}

	public async listFollowerAliases(userAlias: string, pageSize: number, lastFollowerAlias: string | null): Promise<[string[], boolean]> {
		const output = await dynamoDocClient.send(
			new QueryCommand({
				TableName: AppConfig.followTableName,
				IndexName: "tweeter-follow-followee-index",
				KeyConditionExpression: "followee_alias = :followeeAlias",
				ExpressionAttributeValues: {
					":followeeAlias": userAlias,
				},
				ExclusiveStartKey: lastFollowerAlias
					? {
						followee_alias: userAlias,
						follower_alias: lastFollowerAlias,
					}
					: undefined,
				Limit: pageSize,
			}),
		);

		const items = (output.Items ?? []) as FollowItem[];
		return [items.map((item) => item.follower_alias), output.LastEvaluatedKey !== undefined];
	}

	public async listFolloweeAliases(userAlias: string, pageSize: number, lastFolloweeAlias: string | null): Promise<[string[], boolean]> {
		const output = await dynamoDocClient.send(
			new QueryCommand({
				TableName: AppConfig.followTableName,
				KeyConditionExpression: "follower_alias = :followerAlias",
				ExpressionAttributeValues: {
					":followerAlias": userAlias,
				},
				ExclusiveStartKey: lastFolloweeAlias
					? {
						follower_alias: userAlias,
						followee_alias: lastFolloweeAlias,
					}
					: undefined,
				Limit: pageSize,
			}),
		);

		const items = (output.Items ?? []) as FollowItem[];
		return [items.map((item) => item.followee_alias), output.LastEvaluatedKey !== undefined];
	}

	public async getFollowerCount(userAlias: string): Promise<number> {
		const output = await dynamoDocClient.send(
			new QueryCommand({
				TableName: AppConfig.followTableName,
				IndexName: "tweeter-follow-followee-index",
				KeyConditionExpression: "followee_alias = :followeeAlias",
				ExpressionAttributeValues: {
					":followeeAlias": userAlias,
				},
				Select: "COUNT",
			}),
		);

		return output.Count ?? 0;
	}

	public async getFolloweeCount(userAlias: string): Promise<number> {
		const output = await dynamoDocClient.send(
			new QueryCommand({
				TableName: AppConfig.followTableName,
				KeyConditionExpression: "follower_alias = :followerAlias",
				ExpressionAttributeValues: {
					":followerAlias": userAlias,
				},
				Select: "COUNT",
			}),
		);

		return output.Count ?? 0;
	}

	public async putFollow(followerAlias: string, followeeAlias: string): Promise<void> {
		await dynamoDocClient.send(
			new PutCommand({
				TableName: AppConfig.followTableName,
				Item: {
					follower_alias: followerAlias,
					followee_alias: followeeAlias,
				},
				ConditionExpression: "attribute_not_exists(follower_alias) AND attribute_not_exists(followee_alias)",
			}),
		);
	}

	public async deleteFollow(followerAlias: string, followeeAlias: string): Promise<void> {
		await dynamoDocClient.send(
			new DeleteCommand({
				TableName: AppConfig.followTableName,
				Key: {
					follower_alias: followerAlias,
					followee_alias: followeeAlias,
				},
			}),
		);
	}
}
