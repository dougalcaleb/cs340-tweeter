import {FakeData, User} from "tweeter-shared";

export class FollowService {
	public async isFollower(user: User, selectedUser: User): Promise<boolean> {
		if (user.alias.length === 0 || selectedUser.alias.length === 0) {
			throw new Error("bad-request: user alias is required");
		}

		return FakeData.instance.isFollower();
	}

	public async listFollowers(userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);
	}

	public async listFollowees(userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		return FakeData.instance.getPageOfUsers(lastItem, pageSize, userAlias);
	}

	public async getFollowersCount(userAlias: string): Promise<number> {
		return FakeData.instance.getFollowerCount(userAlias);
	}

	public async getFolloweesCount(userAlias: string): Promise<number> {
		return FakeData.instance.getFolloweeCount(userAlias);
	}

	public async follow(userToFollow: User): Promise<void> {
		if (userToFollow.alias.length === 0) {
			throw new Error("bad-request: followee alias is required");
		}
	}

	public async unfollow(userToUnfollow: User): Promise<void> {
		if (userToUnfollow.alias.length === 0) {
			throw new Error("bad-request: followee alias is required");
		}
	}
}
