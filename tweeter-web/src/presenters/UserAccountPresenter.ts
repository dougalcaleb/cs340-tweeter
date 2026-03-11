import { Dispatch, SetStateAction } from "react";
import { NavigateFunction } from "react-router-dom";
import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../services/UserService";

export interface LoginView extends View
{
	setIsLoading: Dispatch<SetStateAction<boolean>>,
	updateUserInfo: (currentUser: User, displayedUser: User | null, authToken: AuthToken, remember: boolean) => void,
	navigate: NavigateFunction,
}

export abstract class UserAccountPresenter<T extends LoginView> extends Presenter<T>
{
	protected _userService: UserService;

	public constructor(view: T)
	{
		super(view);
		this._userService = new UserService();
	}

	protected async setupUserAccount(rememberMe: boolean, navToURL: string | null, userLoginAction: () => Promise<[User, AuthToken]>, desc: string): Promise<void> {
		await this.handleFailure(async () => {
			this._view.setIsLoading(true);

			const [user, authToken] = await userLoginAction();

			this._view.updateUserInfo(user, user, authToken, rememberMe);

			this._view.navigate(navToURL || `/feed/${user.alias}`);
		}, `${desc} user`);

		this._view.setIsLoading(false);
	}
}