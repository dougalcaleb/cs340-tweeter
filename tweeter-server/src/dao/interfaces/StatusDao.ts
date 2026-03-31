import {Status} from "tweeter-shared";

export interface StatusDao {
	listStoryStatuses(userAlias: string, pageSize: number, lastTimestamp: number | null): Promise<[Status[], boolean]>;
	putStatus(status: Status): Promise<void>;
}
