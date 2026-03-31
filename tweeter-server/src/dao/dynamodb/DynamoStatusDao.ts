import {PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import {Status} from "tweeter-shared";
import {AppConfig} from "../../config/AppConfig";
import {StatusDao} from "../interfaces/StatusDao";
import {dynamoDocClient} from "./DynamoClient";
import {buildCreatedAtSortKey, getTimestampFromStatus, StatusItem, toStatusFromStatusItem} from "./DynamoModelUtils";

export class DynamoStatusDao implements StatusDao {
	public async listStoryStatuses(userAlias: string, pageSize: number, lastTimestamp: number | null): Promise<[Status[], boolean]> {
		const output = await dynamoDocClient.send(
			new QueryCommand({
				TableName: AppConfig.statusTableName,
				KeyConditionExpression: "author_alias = :authorAlias",
				ExpressionAttributeValues: {
					":authorAlias": userAlias,
				},
				ScanIndexForward: false,
				Limit: pageSize,
				ExclusiveStartKey: lastTimestamp
					? {
						author_alias: userAlias,
						created_at: buildCreatedAtSortKey(lastTimestamp),
					}
					: undefined,
			}),
		);

		const items = (output.Items ?? []) as StatusItem[];
		return [items.map((item) => toStatusFromStatusItem(item)), output.LastEvaluatedKey !== undefined];
	}

	public async putStatus(status: Status): Promise<void> {
		const timestamp = getTimestampFromStatus(status);
		await dynamoDocClient.send(
			new PutCommand({
				TableName: AppConfig.statusTableName,
				Item: {
					author_alias: status.user.alias,
					created_at: buildCreatedAtSortKey(timestamp),
					post: status.post,
					author_first_name: status.user.firstName,
					author_last_name: status.user.lastName,
					author_image_url: status.user.imageUrl,
					timestamp,
				},
			}),
		);
	}
}
