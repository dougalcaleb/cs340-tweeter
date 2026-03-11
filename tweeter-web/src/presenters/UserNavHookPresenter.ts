import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../services/UserService";
import { NavigateFunction } from "react-router-dom";
import { Presenter, View } from "./Presenter";

export interface UserNavHookView extends View
{
	setDisplayedUser: (user: User) => void,
	navigate: NavigateFunction
}

export class UserNavHookPresenter extends Presenter<UserNavHookView>
{
	private _userService: UserService;

	constructor(view: UserNavHookView) {
		super(view);
		this._userService = new UserService();
	}

	public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
		return this._userService.getUser(authToken, alias);
	}

	public async navigateToUser(authToken: AuthToken, displayedUser: User, target: string, featurePath: string): Promise<void> {
		await this.handleFailure(async () => {
			const index = target.indexOf("@");
			const alias = target.substring(index);

			const toUser = await this.getUser(authToken!, alias);

			if (toUser) {
				if (!toUser.equals(displayedUser!)) {
					this._view.setDisplayedUser(toUser);
					this._view.navigate(`${featurePath}/${toUser.alias}`);
				}
			}
		}, "get user");
	}
}