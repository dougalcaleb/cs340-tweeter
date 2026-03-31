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
}
