import { AuthToken } from "tweeter-shared";
import { AppNavbarPresenter, AppNavbarView } from "../../src/presenters/AppNavbarPresenter";
import { anyString, anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { UserService } from "../../src/services/UserService";

describe("AppNavbarPresenter", () => {
	let mockAppNavbarPresenterView: AppNavbarView;
	let appNavbarPresenter: AppNavbarPresenter;
	let mockUserService: UserService;

	const authToken = new AuthToken("token", Date.now());

	beforeEach(() => {
		mockAppNavbarPresenterView = mock<AppNavbarView>();
		when(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn("infomsgid");
		const mockAppNavbarPresenterViewInstance = instance(mockAppNavbarPresenterView);

		mockUserService = mock<UserService>();

		const appNavbarPresenterSpy = spy(new AppNavbarPresenter(mockAppNavbarPresenterViewInstance));
		appNavbarPresenter = instance(appNavbarPresenterSpy);
		when(appNavbarPresenterSpy._userService).thenReturn(instance(mockUserService));
	});

	it("tells the view to display a logout message", async () => {
		await appNavbarPresenter.logOut(authToken);
		verify(mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)).once();
	});

	it("calls logout on the user service", async () => {
		await appNavbarPresenter.logOut(authToken);

		verify(mockUserService.logoutUser(authToken)).once();
		let [capturedAuthToken] = capture(mockUserService.logoutUser).last();
		expect(capturedAuthToken).toEqual(authToken);
	});

	it("clears previous message, clears user info, navigates to login", async () => {
		await appNavbarPresenter.logOut(authToken);
		
		verify(mockAppNavbarPresenterView.deleteMessage("infomsgid")).once();
		verify(mockAppNavbarPresenterView.clearUserInfo()).once();
		verify(mockAppNavbarPresenterView.navigate("/login")).once();
		verify(mockAppNavbarPresenterView.displayErrorMessage(anyString())).never();
	});

	it("does not navigate to login when logout fails", async () => {
		when(mockUserService.logoutUser(anything())).thenThrow(new Error("err"));

		await appNavbarPresenter.logOut(authToken);

		verify(mockAppNavbarPresenterView.displayErrorMessage(anyString())).once();
		verify(mockAppNavbarPresenterView.deleteMessage(anything())).never();
		verify(mockAppNavbarPresenterView.clearUserInfo()).never();
		verify(mockAppNavbarPresenterView.navigate(anyString())).never();
	});
});
