import {Status, User} from "tweeter-shared";

export type UserItem = {
	alias: string;
	first_name: string;
	last_name: string;
	image_url: string;
	password_hash?: string;
};

export type StatusItem = {
	author_alias: string;
	created_at: string;
	post: string;
	author_first_name: string;
	author_last_name: string;
	author_image_url: string;
	timestamp: number;
};

export type FeedItem = StatusItem & {
	recipient_alias: string;
	originator_alias: string;
};

export const toUser = (item: UserItem): User => {
	return new User(item.first_name, item.last_name, item.alias, item.image_url);
};

export const toStatusFromStatusItem = (item: StatusItem): Status => {
	const user = new User(item.author_first_name, item.author_last_name, item.author_alias, item.author_image_url);
	return new Status(item.post, user, item.timestamp);
};

export const toStatusFromFeedItem = (item: FeedItem): Status => {
	const user = new User(item.author_first_name, item.author_last_name, item.author_alias, item.author_image_url);
	return new Status(item.post, user, item.timestamp);
};

export const buildCreatedAtSortKey = (timestamp: number): string => {
	return timestamp.toString().padStart(13, "0");
};

export const getTimestampFromStatus = (status: Status): number => status.timestamp;
