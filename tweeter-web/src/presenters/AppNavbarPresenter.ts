import { NavigateFunction } from "react-router-dom";
import { UserService } from "../services/UserService";
import { AuthToken } from "tweeter-shared";
import { MessageView, Presenter } from "./Presenter";

export interface AppNavbarView extends MessageView
{
	navigate: NavigateFunction,
	clearUserInfo: () => void
}

export class AppNavbarPresenter extends Presenter<AppNavbarView>
{
	private __userService: UserService;

	constructor(view: AppNavbarView) {
		super(view)
		this.__userService = new UserService();
	}

	public get _userService() {
		return this.__userService;
	}

	public async logOut(authToken: AuthToken): Promise<void> {
		const toastID = this._view.displayInfoMessage("Logging Out...", 0);
		await this.handleFailure(async () => {
			await this.logoutUser(authToken);

			this._view.deleteMessage(toastID);
			this._view.clearUserInfo();
			this._view.navigate("/login");
		}, "log out user");
	}

	private async logoutUser(authToken: AuthToken) {
		await this._userService.logoutUser(authToken);
	}
}