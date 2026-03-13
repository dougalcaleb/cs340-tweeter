import {FakeData, Status} from "tweeter-shared";

export class StatusService {
	public async listStoryItems(userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		if (userAlias.length === 0) {
			throw new Error("bad-request: user alias is required");
		}

		return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
	}

	public async listFeedItems(userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		if (userAlias.length === 0) {
			throw new Error("bad-request: user alias is required");
		}

		return FakeData.instance.getPageOfStatuses(lastItem, pageSize);
	}

	public async createStatus(newStatus: Status): Promise<void> {
		if (newStatus.post.length === 0) {
			throw new Error("bad-request: status content is required");
		}
	}
}
