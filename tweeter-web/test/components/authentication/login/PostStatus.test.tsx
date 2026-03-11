import {render, screen} from "@testing-library/react";
import {act} from "react";
import {PostStatusPresenter} from "../../../../src/presenters/PostStatusPresenter";
import PostStatus from "../../../../src/components/postStatus/PostStatus";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import {library} from "@fortawesome/fontawesome-svg-core";
import {fab} from "@fortawesome/free-brands-svg-icons";
import {useUserInfo} from "../../../../src/components/userInfo/UserInfoHooks";
import {instance, mock, verify} from "@typestrong/ts-mockito";
import {AuthToken, User} from "tweeter-shared";

library.add(fab);

jest.mock("../../../../src/components/userInfo/UserInfoHooks.tsx", () => ({
	...jest.requireActual("../../../../src/components/userInfo/UserInfoHooks.tsx"),
	__esModule: true,
	useUserInfo: jest.fn(),
}));

function renderComponent(presenter?: PostStatusPresenter) {
	return render(<PostStatus presenter={presenter} />);
}

function renderWithRefs(presenter?: PostStatusPresenter) {
	const user = userEvent.setup();
	const component = renderComponent(presenter);

	const input = screen.getByLabelText("status-editor");
	const postButton = screen.getByLabelText("post-status");
	const clearButton = screen.getByLabelText("clear-status");

	return {user, component, input, postButton, clearButton};
}

describe("PostStatus component", () => {
	let authToken: AuthToken;
	let currentUser: User;

	beforeAll(() => {
		const mockUser = mock<User>();
		const mockAuthToken = mock<AuthToken>();
		authToken = instance(mockAuthToken);
		currentUser = instance(mockUser);

		(useUserInfo as jest.Mock).mockReturnValue({
			currentUser,
			authToken,
		});
	});

	it("buttons are disabled initially", async () => {
		const {postButton, clearButton} = renderWithRefs();

		expect(postButton).toBeDisabled();
		expect(clearButton).toBeDisabled();
	});

	it("buttons are enabled when input has text", async () => {
		const {postButton, clearButton, input, user} = renderWithRefs();

		await user.type(input, "my new status");

		expect(postButton).toBeEnabled();
		expect(clearButton).toBeEnabled();
	});

	it("buttons are disabled when input is cleared", async () => {
		const {postButton, clearButton, input, user} = renderWithRefs();

		await user.type(input, "my new status");

		expect(postButton).toBeEnabled();
		expect(clearButton).toBeEnabled();

		await user.clear(input);

		expect(postButton).toBeDisabled();
		expect(clearButton).toBeDisabled();
	});

	it("postStatus is called correctly", async () => {
		const mockPresenter = mock<PostStatusPresenter>();
		const mockPresenterInstance = instance(mockPresenter);

		const { postButton, input, user } = renderWithRefs(mockPresenterInstance);

		await user.type(input, "my exciting status");
		await user.click(postButton);

		verify(mockPresenter.submitPost(authToken, "my exciting status", currentUser)).once();
	});
});
