import { AuthToken, User } from "tweeter-shared";
import { PagedItemPresenter } from "./PagedItemPresenter";

export class FollowerPresenter extends PagedItemPresenter<User>
{
	protected async loadMoreCallee(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return this._followService.loadMoreFollowers(authToken, userAlias, pageSize, lastItem);
	}

	protected getLoadDescription(): string {
		return "followers";
	}
}
