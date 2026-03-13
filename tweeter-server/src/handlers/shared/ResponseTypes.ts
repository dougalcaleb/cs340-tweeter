import {AuthToken, Status, User} from "tweeter-shared";

export interface TweeterResponseBase {
	success: boolean;
	message?: string;
}

export interface UserResponse extends TweeterResponseBase {
	user: User | null;
}

export interface AuthUserResponse extends TweeterResponseBase {
	user: User;
	authToken: AuthToken;
}

export interface IsFollowerResponse extends TweeterResponseBase {
	isFollower: boolean;
}

export interface CountResponse extends TweeterResponseBase {
	count: number;
}

export interface UserPageResponse extends TweeterResponseBase {
	items: User[];
	hasMore: boolean;
}

export interface StatusPageResponse extends TweeterResponseBase {
	items: Status[];
	hasMore: boolean;
}
