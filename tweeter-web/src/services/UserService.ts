import { Buffer } from "buffer";
import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";

export class UserService extends Service
{
	public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
		return this.serverFacade.getUser(authToken, alias);
	};

	public async loginUser(alias: string, password: string): Promise<[User, AuthToken]> {
		return this.serverFacade.loginUser(alias, password);
	}

	public async logoutUser(authToken: AuthToken): Promise<void> {
		await this.serverFacade.logoutUser(authToken);
	}

	public async registerUser(
		firstName: string,
		lastName: string,
		alias: string,
		password: string,
		userImageBytes: Uint8Array,
		fileExt: string,
	): Promise<[User, AuthToken]> {
		const imageStringBase64: string = Buffer.from(userImageBytes).toString("base64");

		return this.serverFacade.registerUser(
			firstName,
			lastName,
			alias,
			password,
			imageStringBase64,
			fileExt,
		);
	}

	public async isFollower(authToken: AuthToken, user: User, selectedUser: User): Promise<boolean> {
		return this.serverFacade.isFollower(authToken, user, selectedUser);
	}
}
