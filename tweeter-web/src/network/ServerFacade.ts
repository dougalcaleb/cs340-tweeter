import {AuthToken, Status, User} from "tweeter-shared";
import {ClientCommunicator} from "./ClientCommunicator";

interface TweeterResponse {
	success: boolean;
	message?: string;
}

interface UserResponse extends TweeterResponse {
	user: User | null;
}

interface AuthUserResponse extends TweeterResponse {
	user: User;
	authToken: AuthToken;
}

interface IsFollowerResponse extends TweeterResponse {
	isFollower: boolean;
}

interface CountResponse extends TweeterResponse {
	count: number;
}

interface UserPageResponse extends TweeterResponse {
	items: User[];
	hasMore: boolean;
}

interface StatusPageResponse extends TweeterResponse {
	items: Status[];
	hasMore: boolean;
}

export class ServerFacade {
	private static readonly apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

	private readonly clientCommunicator: ClientCommunicator;

	public constructor() {
		if (!ServerFacade.apiBaseUrl) {
			throw new Error("VITE_API_BASE_URL is not set");
		}

		this.clientCommunicator = new ClientCommunicator(ServerFacade.apiBaseUrl);
	}

	public async getUser(alias: string): Promise<User | null> {
		const response = await this.clientCommunicator.doPost<{alias: string}, UserResponse>({alias}, "/user/get");

		return this.requireSuccess(response, response.user, "get user");
	}

	public async registerUser(
		firstName: string,
		lastName: string,
		alias: string,
		password: string,
		userImageBase64: string,
		fileExtension: string,
	): Promise<[User, AuthToken]> {
		const response = await this.clientCommunicator.doPost<
			{
				firstName: string;
				lastName: string;
				alias: string;
				password: string;
				userImageBase64: string;
				fileExtension: string;
			},
			AuthUserResponse
		>({firstName, lastName, alias, password, userImageBase64, fileExtension}, "/user/register");

		const user = this.requireSuccess(response, response.user, "register user");
		const authToken = this.requireSuccess(response, response.authToken, "register user");
		return [user, authToken];
	}

	public async loginUser(alias: string, password: string): Promise<[User, AuthToken]> {
		const response = await this.clientCommunicator.doPost<{alias: string; password: string}, AuthUserResponse>({alias, password}, "/user/login");

		const user = this.requireSuccess(response, response.user, "login user");
		const authToken = this.requireSuccess(response, response.authToken, "login user");
		return [user, authToken];
	}

	public async logoutUser(authToken: AuthToken): Promise<void> {
		const response = await this.clientCommunicator.doPost<{authToken: string}, TweeterResponse>({authToken: authToken.token}, "/user/logout");

		this.requireSuccess(response, true, "logout user");
	}

	public async isFollower(user: User, selectedUser: User): Promise<boolean> {
		const response = await this.clientCommunicator.doPost<{user: User; selectedUser: User}, IsFollowerResponse>(
			{user, selectedUser},
			"/follow/status",
		);

		return this.requireSuccess(response, response.isFollower, "check follower status");
	}

	public async getFollowers(userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		const response = await this.clientCommunicator.doPost<{userAlias: string; pageSize: number; lastItem: User | null}, UserPageResponse>(
			{userAlias, pageSize, lastItem},
			"/follow/followers/list",
		);

		const items = this.requireSuccess(response, response.items, "get followers");
		return [items, response.hasMore];
	}

	public async getFollowees(userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		const response = await this.clientCommunicator.doPost<{userAlias: string; pageSize: number; lastItem: User | null}, UserPageResponse>(
			{userAlias, pageSize, lastItem},
			"/follow/followees/list",
		);

		const items = this.requireSuccess(response, response.items, "get followees");
		return [items, response.hasMore];
	}

	public async getFollowerCount(userAlias: string): Promise<number> {
		const response = await this.clientCommunicator.doPost<{userAlias: string}, CountResponse>({userAlias}, "/follow/followers/count");

		return this.requireSuccess(response, response.count, "get followers count");
	}

	public async getFolloweeCount(userAlias: string): Promise<number> {
		const response = await this.clientCommunicator.doPost<{userAlias: string}, CountResponse>({userAlias}, "/follow/followees/count");

		return this.requireSuccess(response, response.count, "get followees count");
	}

	public async follow(userToFollow: User): Promise<void> {
		const response = await this.clientCommunicator.doPost<{userToFollow: User}, TweeterResponse>({userToFollow}, "/follow/create");

		this.requireSuccess(response, true, "follow user");
	}

	public async unfollow(userToUnfollow: User): Promise<void> {
		const response = await this.clientCommunicator.doPost<{userToUnfollow: User}, TweeterResponse>({userToUnfollow}, "/follow/delete");

		this.requireSuccess(response, true, "unfollow user");
	}

	public async getStoryItems(userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		const response = await this.clientCommunicator.doPost<{userAlias: string; pageSize: number; lastItem: Status | null}, StatusPageResponse>(
			{userAlias, pageSize, lastItem},
			"/status/story/list",
		);

		const items = this.requireSuccess(response, response.items, "get story items");
		return [items, response.hasMore];
	}

	public async getFeedItems(userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		const response = await this.clientCommunicator.doPost<{userAlias: string; pageSize: number; lastItem: Status | null}, StatusPageResponse>(
			{userAlias, pageSize, lastItem},
			"/status/feed/list",
		);

		const items = this.requireSuccess(response, response.items, "get feed items");
		return [items, response.hasMore];
	}

	public async postStatus(newStatus: Status): Promise<void> {
		const response = await this.clientCommunicator.doPost<{newStatus: Status}, TweeterResponse>({newStatus}, "/status/create");

		this.requireSuccess(response, true, "post status");
	}

	private requireSuccess<T>(response: TweeterResponse, data: T, operation: string): T {
		if (!response.success) {
			throw new Error(response.message ?? `Unable to ${operation}`);
		}

		return data;
	}
}
