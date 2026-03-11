import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import { LoginPresenter } from "../../../../src/presenters/LoginPresenter";

library.add(fab);

function renderComponent(originalUrl: string, presenter?: LoginPresenter) {
	return render(
		<MemoryRouter>
			<Login originalUrl={originalUrl} presenter={presenter} />
		</MemoryRouter>
	)
}

function renderWithRefs(originalUrl: string, presenter?: LoginPresenter) {
	const user = userEvent.setup();
	const component = renderComponent(originalUrl, presenter);

	const signInButton = screen.getByRole("button", { name: /Sign in/i });
	const aliasField = screen.getByLabelText(/alias/i);
	const passwordField = screen.getByLabelText(/password/i);

	return { signInButton, user, aliasField, passwordField, component };
}

describe("Login component", () => {
	it("starts with sign in button disabled", () => {
		const { signInButton } = renderWithRefs("/");
		expect(signInButton).toBeDisabled();
	});

	it("enables the sign in button when fields filled in", async () => {
		const { signInButton, aliasField, passwordField, user } = renderWithRefs("/");

		await user.type(aliasField, "myalias");
		await user.type(passwordField, "mypassword");

		expect(signInButton).toBeEnabled();
	});

	it("disabled the sign in button when a field is cleared", async () => {
		const { signInButton, aliasField, passwordField, user } = renderWithRefs("/");

		await user.type(aliasField, "myalias");
		await user.type(passwordField, "mypassword");

		expect(signInButton).toBeEnabled();

		await user.clear(aliasField);

		expect(signInButton).toBeDisabled();

		await user.type(aliasField, "mynewalias");

		expect(signInButton).toBeEnabled();

		await user.clear(passwordField);

		expect(signInButton).toBeDisabled();
	});

	it("calls the presenter's login method correctly when sign in pressed", async () => {
		const mockPresenter = mock<LoginPresenter>();
		const mockPresenterInstance = instance(mockPresenter);

		const alias = "myalias";
		const password = "mypassword";
		const origUrl = "/some/url";

		const { signInButton, aliasField, passwordField, user } = renderWithRefs(origUrl, mockPresenterInstance);

		await user.type(aliasField, alias);
		await user.type(passwordField, password);
		await user.click(signInButton);

		verify(mockPresenter.doLogin(alias, password, false, origUrl)).once();
	});
});
