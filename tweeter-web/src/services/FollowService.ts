import {AuthToken, FakeData, User} from "tweeter-shared";
import { Service } from "./Service";

export class FollowService extends Service
{
	public async loadMoreFollowers(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);
	}

	public async loadMoreFollowees(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);
	}

	public async getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
		return FakeData.instance.getFolloweeCount(user.alias);
	}

	public async getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
		return FakeData.instance.getFollowerCount(user.alias);
	}

	public async follow(authToken: AuthToken, userToFollow: User): Promise<void> {
		return await new Promise((f) => setTimeout(f, 2000));
	}

	public async unfollow(authToken: AuthToken, userToUnfollow: User): Promise<void> {
		return await new Promise((f) => setTimeout(f, 2000));
	}
}
