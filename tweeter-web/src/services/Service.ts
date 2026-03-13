import {ServerFacade} from "../network/ServerFacade";

export abstract class Service {
	private static _serverFacade: ServerFacade | null = null;

	protected get serverFacade() {
		if (!Service._serverFacade) {
			Service._serverFacade = new ServerFacade();
		}

		return Service._serverFacade;
	}
}
