import {AuthToken} from "tweeter-shared";

export interface AuthTokenDao {
	createAuthToken(alias: string): Promise<AuthToken>;
	validateAuthToken(token: string): Promise<string | null>;
	deleteAuthToken(token: string): Promise<void>;
}
