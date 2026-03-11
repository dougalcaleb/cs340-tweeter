import { Buffer } from "buffer";
import { AuthToken, FakeData, User } from "tweeter-shared";
import { Service } from "./Service";

export class UserService extends Service
{
	public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
		return FakeData.instance.findUserByAlias(alias);
	};

	public async loginUser(alias: string, password: string): Promise<[User, AuthToken]> {
		const user = FakeData.instance.firstUser;

		if (user === null) {
			throw new Error("Invalid alias or password");
		}

		return [user, FakeData.instance.authToken];
	}

	public async logoutUser(authToken: AuthToken): Promise<void> {
		await new Promise((res) => setTimeout(res, 1000));
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
	
		const user = FakeData.instance.firstUser;

		if (user === null) {
			throw new Error("Invalid registration");
		}

		return [user, FakeData.instance.authToken];
	}

	public async isFollower(authToken: AuthToken, user: User, selectedUser: User): Promise<boolean> {
		return FakeData.instance.isFollower();
	}
}
