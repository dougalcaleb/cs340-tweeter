import { Dispatch, SetStateAction } from "react";
import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../services/StatusService";
import { MessageView, Presenter } from "./Presenter";

export interface PostStatusView extends MessageView
{
	setIsLoading: Dispatch<SetStateAction<boolean>>,
	setPost: Dispatch<SetStateAction<string>>,
}

export class PostStatusPresenter extends Presenter<PostStatusView>
{
	private __statusService: StatusService;

	constructor(view: PostStatusView) {
		super(view);
		this.__statusService = new StatusService();
	}

	public get _statusService() {
		return this.__statusService;
	}

	public async submitPost(authToken: AuthToken, post: string, currentUser: User) {
		let toastID = "";

		await this.handleFailure(async () => {
			this._view.setIsLoading(true);
			toastID = this._view.displayInfoMessage("Posting status...", 0);

			const status = new Status(post, currentUser, Date.now());

			await this._statusService.postStatus(authToken, status);

			this._view.setPost("");
			this._view.displayInfoMessage("Status posted!", 2000);
		}, "post status");

		this._view.deleteMessage(toastID);
		this._view.setIsLoading(false);
	}
}