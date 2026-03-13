import "isomorphic-fetch";

import {AuthToken, Status} from "tweeter-shared";
import {StatusService} from "../../src/services/StatusService";

const apiBaseUrl =
	typeof globalThis === "object" && "process" in globalThis
		? (globalThis as {process?: {env?: Record<string, string | undefined>}}).process?.env?.VITE_API_BASE_URL
		: undefined;
const runIntegration = apiBaseUrl ? describe : describe.skip;

runIntegration("StatusService integration", () => {
	let statusService: StatusService;

	beforeAll(() => {
		statusService = new StatusService();
	});

	it("loadStoryItems returns a successful page of statuses", async () => {
		const authToken = new AuthToken("integration-token", Date.now());

		const [items, hasMore] = await statusService.loadStoryItems(authToken, "@allen", 5, null);

		expect(Array.isArray(items)).toBe(true);
		expect(items.length).toBeGreaterThan(0);
		expect(items[0]).toBeInstanceOf(Status);
		expect(typeof hasMore).toBe("boolean");
		expect(items[0].post.length).toBeGreaterThan(0);
	});
});
