import "isomorphic-fetch";

import {AuthToken} from "tweeter-shared";
import {ServerFacade} from "../../src/network/ServerFacade";

const apiBaseUrl =
	typeof globalThis === "object" && "process" in globalThis
		? (globalThis as {process?: {env?: Record<string, string | undefined>}}).process?.env?.VITE_API_BASE_URL
		: undefined;
const runIntegration = apiBaseUrl ? describe : describe.skip;

runIntegration("ServerFacade integration", () => {
	let serverFacade: ServerFacade;
	let authToken: AuthToken;

	beforeAll(() => {
		serverFacade = new ServerFacade(apiBaseUrl);
		authToken = new AuthToken("integration-test-token", Date.now());
	});

	it("register returns a user and auth token", async () => {
		const uniqueSuffix = Date.now();
		const [user, authToken] = await serverFacade.registerUser(
			"Allen",
			"Anderson",
			`@integration_${uniqueSuffix}`,
			"password123",
			"aGVsbG8=",
			"png",
		);

		expect(user).toBeTruthy();
		expect(user.alias.length).toBeGreaterThan(0);
		expect(authToken).toBeTruthy();
		expect(authToken.token.length).toBeGreaterThan(0);
	});

	it("getFollowers returns users and pagination state", async () => {
		const [followers, hasMore] = await serverFacade.getFollowers(authToken, "@allen", 5, null);

		expect(Array.isArray(followers)).toBe(true);
		expect(followers.length).toBeGreaterThan(0);
		expect(typeof hasMore).toBe("boolean");
		expect(typeof followers[0].alias).toBe("string");
	});

	it("getFollowerCount returns a positive number", async () => {
		const count = await serverFacade.getFollowerCount(authToken, "@allen");

		expect(typeof count).toBe("number");
		expect(count).toBeGreaterThan(0);
	});
});
