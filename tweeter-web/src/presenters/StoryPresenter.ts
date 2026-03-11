import { AuthToken, Status } from "tweeter-shared";
import { PagedItemPresenter } from "./PagedItemPresenter";

export class StoryPresenter extends PagedItemPresenter<Status>
{
	protected async loadMoreCallee(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		return this._statusService.loadStoryItems(authToken, userAlias, pageSize, lastItem);
	}

	protected getLoadDescription(): string {
		return "stories";
	}
}