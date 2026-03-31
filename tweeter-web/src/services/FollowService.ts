import {AuthToken, User} from "tweeter-shared";
import { Service } from "./Service";

export class FollowService extends Service
{
	public async loadMoreFollowers(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return this.serverFacade.getFollowers(authToken, userAlias, pageSize, lastItem);
	}

	public async loadMoreFollowees(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return this.serverFacade.getFollowees(authToken, userAlias, pageSize, lastItem);
	}

	public async getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
		return this.serverFacade.getFolloweeCount(authToken, user.alias);
	}

	public async getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
		return this.serverFacade.getFollowerCount(authToken, user.alias);
	}

	public async follow(authToken: AuthToken, userToFollow: User): Promise<void> {
		return this.serverFacade.follow(authToken, userToFollow);
	}

	public async unfollow(authToken: AuthToken, userToUnfollow: User): Promise<void> {
		return this.serverFacade.unfollow(authToken, userToUnfollow);
	}
}
