import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../services/UserService";
import { FollowService } from "../services/FollowService";
import { StatusService } from "../services/StatusService";

export const PAGE_SIZE = 10;

export interface PagedItemView<T> extends View
{
	addItems: (newItems: T[]) => void,
}

export abstract class PagedItemPresenter<T> extends Presenter<PagedItemView<T>>
{
	protected _userService: UserService;
	protected _followService: FollowService;
	protected _statusService: StatusService;

	protected _hasMoreItems = true;
	protected _lastItem: T | null = null;

	public constructor(view: PagedItemView<T>) {
		super(view);
		this._userService = new UserService();
		this._followService = new FollowService();
		this._statusService = new StatusService();
	}

	public get hasMoreItems() {
		return this._hasMoreItems;
	}

	public async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
		return this._userService.getUser(authToken, alias);
	}

	public reset() {
		this._lastItem = null;
		this._hasMoreItems = true;
	}

	public async loadMoreItems(authToken: AuthToken, userAlias: string): Promise<void> {
		await this.handleFailure(async () => {
			const [newItems, hasMore] = await this.loadMoreCallee(authToken, userAlias, PAGE_SIZE, this._lastItem);

			this._hasMoreItems = hasMore;
			this._lastItem = newItems.length ? newItems[newItems.length - 1] : null;
			this._view.addItems(newItems);
		}, `load ${this.getLoadDescription()}`);
	}

	protected abstract loadMoreCallee(authToken: AuthToken, userAlias: string, pageSize: number, lastItem: T | null): Promise<[T[], boolean]>;

	protected abstract getLoadDescription(): string;
}