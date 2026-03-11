import {LoginView, UserAccountPresenter} from "./UserAccountPresenter";

export class LoginPresenter extends UserAccountPresenter<LoginView>
{
	public async doLogin(alias: string, password: string, remember: boolean, originalUrl: string): Promise<void> {
		return await this.setupUserAccount(remember, originalUrl, () => this._userService.loginUser(alias, password), "log in");
	}

	public async loginOnEnter(key: string, alias: string, password: string, remember: boolean, originalUrl: string): Promise<void> {
		if (key === "Enter" && alias && password) {
			this.doLogin(alias, password, remember, originalUrl);
		}
	}
}
