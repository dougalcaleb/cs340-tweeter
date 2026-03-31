import { AuthToken, Status } from "tweeter-shared";
import { Service } from "./Service";

export class StatusService extends Service
{
	public async loadStoryItems(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		return this.serverFacade.getStoryItems(authToken, userAlias, pageSize, lastItem);
	}

	public async loadFeedItems(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		return this.serverFacade.getFeedItems(authToken, userAlias, pageSize, lastItem);
	}

	public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
		await this.serverFacade.postStatus(authToken, newStatus);
	}
}