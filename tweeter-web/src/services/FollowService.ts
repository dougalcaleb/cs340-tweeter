import {AuthToken, User} from "tweeter-shared";
import { Service } from "./Service";

export class FollowService extends Service
{
	public async loadMoreFollowers(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return this.serverFacade.getFollowers(userAlias, pageSize, lastItem);
	}

	public async loadMoreFollowees(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return this.serverFacade.getFollowees(userAlias, pageSize, lastItem);
	}

	public async getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
		return this.serverFacade.getFolloweeCount(user.alias);
	}

	public async getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
		return this.serverFacade.getFollowerCount(user.alias);
	}

	public async follow(authToken: AuthToken, userToFollow: User): Promise<void> {
		return this.serverFacade.follow(userToFollow);
	}

	public async unfollow(authToken: AuthToken, userToUnfollow: User): Promise<void> {
		return this.serverFacade.unfollow(userToUnfollow);
	}
}
