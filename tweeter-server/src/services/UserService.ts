import {AuthToken, FakeData, User} from "tweeter-shared";

export class UserService {
	public async getUser(alias: string): Promise<User | null> {
		return FakeData.instance.findUserByAlias(alias);
	}

	public async loginUser(alias: string, password: string): Promise<[User, AuthToken]> {
		const user = FakeData.instance.firstUser;
		if (user == null || alias.length === 0 || password.length === 0) {
			throw new Error("unauthorized: invalid alias or password");
		}

		return [user, FakeData.instance.authToken];
	}

	public async registerUser(
		firstName: string,
		lastName: string,
		alias: string,
		password: string,
		imageBase64: string,
		fileExt: string,
	): Promise<[User, AuthToken]> {
		const user = FakeData.instance.firstUser;

		if (
			user == null ||
			firstName.length === 0 ||
			lastName.length === 0 ||
			alias.length === 0 ||
			password.length === 0 ||
			imageBase64.length === 0 ||
			fileExt.length === 0
		) {
			throw new Error("bad-request: invalid registration payload");
		}

		return [user, FakeData.instance.authToken];
	}

	public async logoutUser(authToken: string): Promise<void> {
		if (authToken.length === 0) {
			throw new Error("unauthorized: missing auth token");
		}
	}
}
