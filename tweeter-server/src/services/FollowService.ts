import {User} from "tweeter-shared";
import {DaoFactory, daoFactory} from "../dao/DaoFactory";
import {FollowDao} from "../dao/interfaces/FollowDao";
import {UserDao} from "../dao/interfaces/UserDao";
import {AuthorizationService} from "./AuthorizationService";

export class FollowService {
	private readonly followDao: FollowDao;
	private readonly userDao: UserDao;
	private readonly authorizationService: AuthorizationService;

	public constructor(factory: DaoFactory = daoFactory) {
		this.followDao = factory.createFollowDao();
		this.userDao = factory.createUserDao();
		this.authorizationService = new AuthorizationService(factory);
	}

	public async isFollower(authToken: string, user: User, selectedUser: User): Promise<boolean> {
		const authenticatedAlias = await this.authorizationService.requireAuthorization(authToken);
		if (authenticatedAlias !== user.alias) {
			throw new Error("unauthorized: auth token does not match requesting user");
		}

		if (user.alias.length === 0 || selectedUser.alias.length === 0) {
			throw new Error("bad-request: user alias is required");
		}

		return this.followDao.isFollower(user.alias, selectedUser.alias);
	}

	public async listFollowers(authToken: string, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		await this.authorizationService.requireAuthorization(authToken);
		const [aliases, hasMore] = await this.followDao.listFollowerAliases(userAlias, pageSize, lastItem?.alias ?? null);
		const users = await this.userDao.getUsersByAliases(aliases);
		return [users, hasMore];
	}

	public async listFollowees(authToken: string, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		await this.authorizationService.requireAuthorization(authToken);
		const [aliases, hasMore] = await this.followDao.listFolloweeAliases(userAlias, pageSize, lastItem?.alias ?? null);
		const users = await this.userDao.getUsersByAliases(aliases);
		return [users, hasMore];
	}

	public async getFollowersCount(authToken: string, userAlias: string): Promise<number> {
		await this.authorizationService.requireAuthorization(authToken);
		return this.followDao.getFollowerCount(userAlias);
	}

	public async getFolloweesCount(authToken: string, userAlias: string): Promise<number> {
		await this.authorizationService.requireAuthorization(authToken);
		return this.followDao.getFolloweeCount(userAlias);
	}

	public async follow(authToken: string, userToFollow: User): Promise<void> {
		const followerAlias = await this.authorizationService.requireAuthorization(authToken);
		if (userToFollow.alias.length === 0) {
			throw new Error("bad-request: followee alias is required");
		}

		if (followerAlias === userToFollow.alias) {
			throw new Error("bad-request: cannot follow yourself");
		}

		const followee = await this.userDao.getUserByAlias(userToFollow.alias);
		if (!followee) {
			throw new Error("bad-request: followee does not exist");
		}

		await this.followDao.putFollow(followerAlias, userToFollow.alias);
	}

	public async unfollow(authToken: string, userToUnfollow: User): Promise<void> {
		const followerAlias = await this.authorizationService.requireAuthorization(authToken);
		if (userToUnfollow.alias.length === 0) {
			throw new Error("bad-request: followee alias is required");
		}

		await this.followDao.deleteFollow(followerAlias, userToUnfollow.alias);
	}
}
