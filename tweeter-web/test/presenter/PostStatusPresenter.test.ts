import { anyString, anything, deepEqual, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { PostStatusPresenter, PostStatusView } from "../../src/presenters/PostStatusPresenter";
import { StatusService } from "../../src/services/StatusService";
import { AuthToken, Status, User } from "tweeter-shared";

describe("PostStatusPresenter", () => {
	let mockPostStatusPresenterView: PostStatusView;
	let postStatusPresenter: PostStatusPresenter;
	let mockStatusService: StatusService;

	const authToken = new AuthToken("token", Date.now());
	const user = new User("fname", "lname", "@alias", "img/url");

	beforeEach(() => {
		mockPostStatusPresenterView = mock<PostStatusView>();
		when(mockPostStatusPresenterView.displayInfoMessage(anything(), 0)).thenReturn("infomsgid");
		const mockAppNavbarPresenterViewInstance = instance(mockPostStatusPresenterView);

		mockStatusService = mock<StatusService>();

		const postStatusPresenterSpy = spy(new PostStatusPresenter(mockAppNavbarPresenterViewInstance));
		postStatusPresenter = instance(postStatusPresenterSpy);
		when(postStatusPresenterSpy._statusService).thenReturn(instance(mockStatusService));
	});

	it("posts a status message", async () => {
		await postStatusPresenter.submitPost(authToken, anyString(), user);

		verify(mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)).once();
	});

	it("correctly calls the service", async () => {
		const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(5000);
		try {
			await postStatusPresenter.submitPost(authToken, "my cool post", user);

			verify(mockStatusService.postStatus(authToken, deepEqual(new Status("my cool post", user, 5000)))).once();
		} finally {
			dateNowSpy.mockRestore();
		}
	});

	it("clears the message, clears the post, and displays a message", async () => {
		await postStatusPresenter.submitPost(authToken, "cool post", user);

		verify(mockPostStatusPresenterView.deleteMessage("infomsgid")).once();
		verify(mockPostStatusPresenterView.setPost("")).once();
		verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).once();
	});

	it("clears the message and displays an error when posting fails", async () => {
		when(mockStatusService.postStatus(anything(), anything())).thenThrow(new Error("err"));

		await postStatusPresenter.submitPost(authToken, "my interesting post", user);

		verify(mockPostStatusPresenterView.deleteMessage("infomsgid")).once();
		verify(mockPostStatusPresenterView.displayErrorMessage(anything())).once();
		verify(mockPostStatusPresenterView.setPost(anything())).never();
		verify(mockPostStatusPresenterView.displayInfoMessage(anything(), anything())).once(); // not called a second time
	});
});