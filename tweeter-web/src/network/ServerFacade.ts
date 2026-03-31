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
	private readonly clientCommunicator: ClientCommunicator;

	public constructor(apiBaseUrl?: string) {
		const nodeEnvBaseUrl =
			typeof globalThis === "object" && "process" in globalThis
				? (globalThis as {process?: {env?: Record<string, string | undefined>}}).process?.env
					?.VITE_API_BASE_URL
				: undefined;

		const runtimeBaseUrl =
			apiBaseUrl ??
			(typeof globalThis === "object" && "__TWEETER_API_BASE_URL__" in globalThis
				? (globalThis as {__TWEETER_API_BASE_URL__?: string}).__TWEETER_API_BASE_URL__
				: undefined) ??
			nodeEnvBaseUrl;

		if (!runtimeBaseUrl) {
			throw new Error("VITE_API_BASE_URL is not set");
		}

		this.clientCommunicator = new ClientCommunicator(runtimeBaseUrl);
	}

	public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
		const response = await this.clientCommunicator.doPost<{authToken: string; alias: string}, UserResponse>(
			{authToken: authToken.token, alias},
			"/user/get",
		);
		const user = this.requireSuccess(response, response.user, "get user");

		return this.toUser(user);
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

		const user = this.toRequiredUser(this.requireSuccess(response, response.user, "register user"), "register user");
		const authToken = this.toRequiredAuthToken(this.requireSuccess(response, response.authToken, "register user"), "register user");
		return [user, authToken];
	}

	public async loginUser(alias: string, password: string): Promise<[User, AuthToken]> {
		const response = await this.clientCommunicator.doPost<{alias: string; password: string}, AuthUserResponse>({alias, password}, "/user/login");

		const user = this.toRequiredUser(this.requireSuccess(response, response.user, "login user"), "login user");
		const authToken = this.toRequiredAuthToken(this.requireSuccess(response, response.authToken, "login user"), "login user");
		return [user, authToken];
	}

	public async logoutUser(authToken: AuthToken): Promise<void> {
		const response = await this.clientCommunicator.doPost<{authToken: string}, TweeterResponse>({authToken: authToken.token}, "/user/logout");

		this.requireSuccess(response, true, "logout user");
	}

	public async isFollower(authToken: AuthToken, user: User, selectedUser: User): Promise<boolean> {
		const response = await this.clientCommunicator.doPost<{authToken: string; user: User; selectedUser: User}, IsFollowerResponse>(
			{authToken: authToken.token, user, selectedUser},
			"/follow/status",
		);

		return this.requireSuccess(response, response.isFollower, "check follower status");
	}

	public async getFollowers(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		const response = await this.clientCommunicator.doPost<
			{authToken: string; userAlias: string; pageSize: number; lastItem: User | null},
			UserPageResponse
		>(
			{authToken: authToken.token, userAlias, pageSize, lastItem},
			"/follow/followers/list",
		);

		const items = this.toUsers(this.requireSuccess(response, response.items, "get followers"));
		return [items, response.hasMore];
	}

	public async getFollowees(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: User | null): Promise<[User[], boolean]> {
		const response = await this.clientCommunicator.doPost<
			{authToken: string; userAlias: string; pageSize: number; lastItem: User | null},
			UserPageResponse
		>(
			{authToken: authToken.token, userAlias, pageSize, lastItem},
			"/follow/followees/list",
		);

		const items = this.toUsers(this.requireSuccess(response, response.items, "get followees"));
		return [items, response.hasMore];
	}

	public async getFollowerCount(authToken: AuthToken, userAlias: string): Promise<number> {
		const response = await this.clientCommunicator.doPost<{authToken: string; userAlias: string}, CountResponse>(
			{authToken: authToken.token, userAlias},
			"/follow/followers/count",
		);

		return this.requireSuccess(response, response.count, "get followers count");
	}

	public async getFolloweeCount(authToken: AuthToken, userAlias: string): Promise<number> {
		const response = await this.clientCommunicator.doPost<{authToken: string; userAlias: string}, CountResponse>(
			{authToken: authToken.token, userAlias},
			"/follow/followees/count",
		);

		return this.requireSuccess(response, response.count, "get followees count");
	}

	public async follow(authToken: AuthToken, userToFollow: User): Promise<void> {
		const response = await this.clientCommunicator.doPost<{authToken: string; userToFollow: User}, TweeterResponse>(
			{authToken: authToken.token, userToFollow},
			"/follow/create",
		);

		this.requireSuccess(response, true, "follow user");
	}

	public async unfollow(authToken: AuthToken, userToUnfollow: User): Promise<void> {
		const response = await this.clientCommunicator.doPost<{authToken: string; userToUnfollow: User}, TweeterResponse>(
			{authToken: authToken.token, userToUnfollow},
			"/follow/delete",
		);

		this.requireSuccess(response, true, "unfollow user");
	}

	public async getStoryItems(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		const response = await this.clientCommunicator.doPost<
			{authToken: string; userAlias: string; pageSize: number; lastItem: Status | null},
			StatusPageResponse
		>(
			{authToken: authToken.token, userAlias, pageSize, lastItem},
			"/status/story/list",
		);

		const items = this.toStatuses(this.requireSuccess(response, response.items, "get story items"));
		return [items, response.hasMore];
	}

	public async getFeedItems(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		const response = await this.clientCommunicator.doPost<
			{authToken: string; userAlias: string; pageSize: number; lastItem: Status | null},
			StatusPageResponse
		>(
			{authToken: authToken.token, userAlias, pageSize, lastItem},
			"/status/feed/list",
		);

		const items = this.toStatuses(this.requireSuccess(response, response.items, "get feed items"));
		return [items, response.hasMore];
	}

	public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
		const response = await this.clientCommunicator.doPost<{authToken: string; newStatus: Status}, TweeterResponse>(
			{authToken: authToken.token, newStatus},
			"/status/create",
		);

		this.requireSuccess(response, true, "post status");
	}

	private requireSuccess<T>(response: TweeterResponse, data: T, operation: string): T {
		if (!response.success) {
			throw new Error(response.message ?? `Unable to ${operation}`);
		}

		return data;
	}

	private toRequiredUser(payload: User | null, operation: string): User {
		const user = this.toUser(payload);
		if (user == null) {
			throw new Error(`Unable to ${operation}`);
		}

		return user;
	}

	private toRequiredAuthToken(payload: AuthToken | null, operation: string): AuthToken {
		const authToken = this.toAuthToken(payload);
		if (authToken == null) {
			throw new Error(`Unable to ${operation}`);
		}

		return authToken;
	}

	private toUser(payload: User | null): User | null {
		if (payload == null) {
			return null;
		}

		if (payload instanceof User) {
			return payload;
		}

		return User.fromJson(JSON.stringify(payload));
	}

	private toUsers(payload: User[]): User[] {
		return payload
			.map((user) => this.toUser(user))
			.filter((user): user is User => user !== null);
	}

	private toAuthToken(payload: AuthToken | null): AuthToken | null {
		if (payload == null) {
			return null;
		}

		if (payload instanceof AuthToken) {
			return payload;
		}

		return AuthToken.fromJson(JSON.stringify(payload));
	}

	private toStatus(payload: Status | null): Status | null {
		if (payload == null) {
			return null;
		}

		if (payload instanceof Status) {
			return payload;
		}

		return Status.fromJson(JSON.stringify(payload));
	}

	private toStatuses(payload: Status[]): Status[] {
		return payload
			.map((status) => this.toStatus(status))
			.filter((status): status is Status => status !== null);
	}
}
