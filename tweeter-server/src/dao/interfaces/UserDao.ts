import {User} from "tweeter-shared";

export interface UserCredentialsRecord {
	user: User;
	passwordHash: string;
}

export interface UserDao {
	getUserByAlias(alias: string): Promise<User | null>;
	getUserCredentialsByAlias(alias: string): Promise<UserCredentialsRecord | null>;
	putUser(user: User, passwordHash: string): Promise<void>;
	getUsersByAliases(aliases: string[]): Promise<User[]>;
	incrementFollowerCount(alias: string): Promise<void>;
	decrementFollowerCount(alias: string): Promise<void>;
	incrementFolloweeCount(alias: string): Promise<void>;
	decrementFolloweeCount(alias: string): Promise<void>;
}
