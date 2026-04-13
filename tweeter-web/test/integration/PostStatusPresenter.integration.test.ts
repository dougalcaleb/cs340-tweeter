import "isomorphic-fetch";

import {anything, instance, mock, verify, when} from "@typestrong/ts-mockito";
import {AuthToken, User} from "tweeter-shared";
import {PostStatusPresenter, PostStatusView} from "../../src/presenters/PostStatusPresenter";
import {StatusService} from "../../src/services/StatusService";
import {ServerFacade} from "../../src/network/ServerFacade";

const apiBaseUrl =
	typeof globalThis === "object" && "process" in globalThis
		? (globalThis as {process?: {env?: Record<string, string | undefined>}}).process?.env?.VITE_API_BASE_URL
		: undefined;
const runIntegration = apiBaseUrl ? describe : describe.skip;

runIntegration("PostStatusPresenter integration", () => {
	jest.setTimeout(30000);

	let serverFacade: ServerFacade;
	let statusService: StatusService;
	let authToken: AuthToken;
	let currentUser: User;

	beforeAll(async () => {
		serverFacade = new ServerFacade(apiBaseUrl);
		statusService = new StatusService();

		const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
		const alias = `@postint_${uniqueSuffix}`;
		const password = "password123";

		await serverFacade.registerUser("Poster", "Integration", alias, password, "aGVsbG8=", "png");
		const [loggedInUser, loggedInAuthToken] = await serverFacade.loginUser(alias, password);

		currentUser = loggedInUser;
		authToken = loggedInAuthToken;
	});

	afterAll(async () => {
		if (authToken) {
			await serverFacade.logoutUser(authToken);
		}
	});

	it("posts through presenter, shows success message, and appends status to story", async () => {
		const mockView = mock<PostStatusView>();
		when(mockView.displayInfoMessage("Posting status...", 0)).thenReturn("posting-id");
		when(mockView.displayInfoMessage("Status posted!", 2000)).thenReturn("posted-id");
		when(mockView.displayInfoMessage(anything(), anything(), anything())).thenReturn("msg-id");

		const presenter = new PostStatusPresenter(instance(mockView));
		const uniquePost = `integration status ${Date.now()} #m4b`;

		await presenter.submitPost(authToken, uniquePost, currentUser);

		verify(mockView.displayInfoMessage("Posting status...", 0)).once();
		verify(mockView.displayInfoMessage("Status posted!", 2000)).once();
		verify(mockView.deleteMessage("posting-id")).once();

		const [storyItems] = await statusService.loadStoryItems(authToken, currentUser.alias, 10, null);
		expect(storyItems.length).toBeGreaterThan(0);

		const postedStatus = storyItems.find((item) => item.post === uniquePost);
		expect(postedStatus).toBeDefined();
		expect(postedStatus?.user.alias).toBe(currentUser.alias);
		expect(postedStatus?.user.firstName).toBe(currentUser.firstName);
		expect(postedStatus?.user.lastName).toBe(currentUser.lastName);
		expect(typeof postedStatus?.timestamp).toBe("number");
	});
});
