import bcrypt from "bcryptjs";
import {AuthToken, User} from "tweeter-shared";
import {DaoFactory, daoFactory} from "../dao/DaoFactory";
import {AuthTokenDao} from "../dao/interfaces/AuthTokenDao";
import {ImageDao} from "../dao/interfaces/ImageDao";
import {UserDao} from "../dao/interfaces/UserDao";
import {AuthorizationService} from "./AuthorizationService";

export class UserService {
	private readonly userDao: UserDao;
	private readonly authTokenDao: AuthTokenDao;
	private readonly imageDao: ImageDao;
	private readonly authorizationService: AuthorizationService;

	public constructor(factory: DaoFactory = daoFactory) {
		this.userDao = factory.createUserDao();
		this.authTokenDao = factory.createAuthTokenDao();
		this.imageDao = factory.createImageDao();
		this.authorizationService = new AuthorizationService(factory);
	}

	public async getUser(authToken: string, alias: string): Promise<User | null> {
		await this.authorizationService.requireAuthorization(authToken);
		return this.userDao.getUserByAlias(alias);
	}

	public async loginUser(alias: string, password: string): Promise<[User, AuthToken]> {
		if (alias.length === 0 || password.length === 0) {
			throw new Error("unauthorized: invalid alias or password");
		}

		const userCredentials = await this.userDao.getUserCredentialsByAlias(alias);
		if (!userCredentials) {
			throw new Error("unauthorized: invalid alias or password");
		}

		const isPasswordValid = await bcrypt.compare(password, userCredentials.passwordHash);
		if (!isPasswordValid) {
			throw new Error("unauthorized: invalid alias or password");
		}

		const authToken = await this.authTokenDao.createAuthToken(alias);
		return [userCredentials.user, authToken];
	}

	public async registerUser(
		firstName: string,
		lastName: string,
		alias: string,
		password: string,
		imageBase64: string,
		fileExt: string,
	): Promise<[User, AuthToken]> {
		if (
			firstName.length === 0 ||
			lastName.length === 0 ||
			alias.length === 0 ||
			password.length === 0 ||
			imageBase64.length === 0 ||
			fileExt.length === 0
		) {
			throw new Error("bad-request: invalid registration payload");
		}

		const safeFileExtension = fileExt.replace(".", "").toLowerCase();
		const contentType = this.getImageContentType(safeFileExtension);
		const fileName = `${alias.replace("@", "")}-${Date.now()}.${safeFileExtension}`;
		const imageUrl = await this.imageDao.putImage(fileName, imageBase64, contentType);

		const user = new User(firstName, lastName, alias, imageUrl);
		const passwordHash = await bcrypt.hash(password, 10);

		try {
			await this.userDao.putUser(user, passwordHash);
		} catch (error) {
			if ((error as {name?: string}).name === "ConditionalCheckFailedException") {
				throw new Error("bad-request: alias already exists");
			}

			throw error;
		}

		const authToken = await this.authTokenDao.createAuthToken(alias);
		return [user, authToken];
	}

	public async logoutUser(authToken: string): Promise<void> {
		await this.authorizationService.requireAuthorization(authToken);
		await this.authTokenDao.deleteAuthToken(authToken);
	}

	private getImageContentType(fileExtension: string): string {
		switch (fileExtension) {
			case "png":
				return "image/png";
			case "jpg":
			case "jpeg":
				return "image/jpeg";
			case "gif":
				return "image/gif";
			case "webp":
				return "image/webp";
			default:
				throw new Error("bad-request: unsupported image file extension");
		}
	}
}
