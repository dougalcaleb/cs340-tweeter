import {BatchWriteCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import {Status} from "tweeter-shared";
import {AppConfig} from "../../config/AppConfig";
import {FeedDao} from "../interfaces/FeedDao";
import {dynamoDocClient} from "./DynamoClient";
import {buildCreatedAtSortKey, FeedItem, getTimestampFromStatus, toStatusFromFeedItem} from "./DynamoModelUtils";

const DYNAMO_BATCH_WRITE_SIZE = 25;

export class DynamoFeedDao implements FeedDao {
	public async listFeedStatuses(userAlias: string, pageSize: number, lastTimestamp: number | null): Promise<[Status[], boolean]> {
		const output = await dynamoDocClient.send(
			new QueryCommand({
				TableName: AppConfig.feedTableName,
				KeyConditionExpression: "recipient_alias = :recipientAlias",
				ExpressionAttributeValues: {
					":recipientAlias": userAlias,
				},
				ScanIndexForward: false,
				Limit: pageSize,
				ExclusiveStartKey: lastTimestamp
					? {
						recipient_alias: userAlias,
						created_at: buildCreatedAtSortKey(lastTimestamp),
					}
					: undefined,
			}),
		);

		const items = (output.Items ?? []) as FeedItem[];
		return [items.map((item) => toStatusFromFeedItem(item)), output.LastEvaluatedKey !== undefined];
	}

	public async batchPutFeedStatuses(recipientAliases: string[], status: Status): Promise<void> {
		if (recipientAliases.length === 0) {
			return;
		}

		const timestamp = getTimestampFromStatus(status);
		const createdAt = buildCreatedAtSortKey(timestamp);

		for (let i = 0; i < recipientAliases.length; i += DYNAMO_BATCH_WRITE_SIZE) {
			const chunk = recipientAliases.slice(i, i + DYNAMO_BATCH_WRITE_SIZE);
			await dynamoDocClient.send(
				new BatchWriteCommand({
					RequestItems: {
						[AppConfig.feedTableName]: chunk.map((recipientAlias) => ({
							PutRequest: {
								Item: {
									recipient_alias: recipientAlias,
									originator_alias: status.user.alias,
									created_at: createdAt,
									post: status.post,
									author_alias: status.user.alias,
									author_first_name: status.user.firstName,
									author_last_name: status.user.lastName,
									author_image_url: status.user.imageUrl,
									timestamp,
								},
							},
						})),
					},
				}),
			);
		}
	}
}
