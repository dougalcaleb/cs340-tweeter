import { AuthToken, FakeData, Status } from "tweeter-shared";
import { Service } from "./Service";

export class StatusService extends Service
{
	public async loadStoryItems(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
	}

	public async loadFeedItems(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
	}

	public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
		await new Promise((res) => setTimeout(res, 2000));
	}
}