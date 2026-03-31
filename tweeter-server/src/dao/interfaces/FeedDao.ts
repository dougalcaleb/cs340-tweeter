import {Status} from "tweeter-shared";

export interface FeedDao {
	listFeedStatuses(userAlias: string, pageSize: number, lastTimestamp: number | null): Promise<[Status[], boolean]>;
	batchPutFeedStatuses(recipientAliases: string[], status: Status): Promise<void>;
}
