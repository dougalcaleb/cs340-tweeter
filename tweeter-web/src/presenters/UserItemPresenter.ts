import { User } from "tweeter-shared";
import { FollowService } from "../services/FollowService";
import { PagedItemPresenter, PagedItemView } from "./PagedItemPresenter";

export abstract class UserItemPresenter extends PagedItemPresenter<User>
{
	protected _followService: FollowService;
	
	public constructor(view: PagedItemView<User>) {
		super(view);
		this._followService = new FollowService();
	}
}