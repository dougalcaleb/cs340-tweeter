import {DaoFactory, daoFactory} from "../dao/DaoFactory";

export class AuthorizationService {
	private readonly authTokenDao;

	public constructor(factory: DaoFactory = daoFactory) {
		this.authTokenDao = factory.createAuthTokenDao();
	}

	public async requireAuthorization(authToken: string): Promise<string> {
		if (authToken.trim().length === 0) {
			throw new Error("unauthorized: missing auth token");
		}

		const alias = await this.authTokenDao.validateAuthToken(authToken);
		if (!alias) {
			throw new Error("unauthorized: invalid or expired auth token");
		}

		return alias;
	}
}
