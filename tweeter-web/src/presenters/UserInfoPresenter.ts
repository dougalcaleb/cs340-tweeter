import { Dispatch, SetStateAction } from "react";
import { AuthToken, Follow, User } from "tweeter-shared";
import { UserService } from "../services/UserService";
import { FollowService } from "../services/FollowService";
import { Location, NavigateFunction } from "react-router-dom";
import { MessageView, Presenter, View } from "./Presenter";

export interface UserInfoView extends MessageView
{
	setIsLoading: Dispatch<SetStateAction<boolean>>,
	setIsFollower: Dispatch<SetStateAction<boolean>>,
	setFolloweeCount: Dispatch<SetStateAction<number>>,
	setFollowerCount: Dispatch<SetStateAction<number>>,
	setDisplayedUser: (user: User) => void,
	navigate: NavigateFunction,
}

export class UserInfoPresenter extends Presenter<UserInfoView>
{
	private _userService: UserService;
	private _followService: FollowService;

	constructor(view: UserInfoView) {
		super(view);
		this._userService = new UserService();
		this._followService = new FollowService();
	}

	public async setIsFollowerStatus(authToken: AuthToken, currentUser: User, displayedUser: User): Promise<void> {
		await this.handleFailure(async () => {
			if (currentUser === displayedUser) {
				this._view.setIsFollower(false);
			} else {
				this._view.setIsFollower(await this._userService.isFollower(authToken!, currentUser!, displayedUser!));
			}
		}, "determine follower status");
	}

	public async getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
		return this._followService.getFolloweeCount(authToken, user);
	}

	public async getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
		return this._followService.getFollowerCount(authToken, user);
	}

	public async setNumFollowees(authToken: AuthToken, displayedUser: User): Promise<void> {
		await this.handleFailure(async () => {
			this._view.setFolloweeCount(await this.getFolloweeCount(authToken, displayedUser));
		}, "get followees count");
	}

	public async setNumFollowers(authToken: AuthToken, displayedUser: User): Promise<void> {
		await this.handleFailure(async () => {
			this._view.setFollowerCount(await this.getFollowerCount(authToken, displayedUser));
		}, "get followers count");
	}

	public async followDisplayedUser(authToken: AuthToken, displayedUser: User): Promise<void> {
		let toastID = "";

		await this.handleFailure(async () => {
			this._view.setIsLoading(true);
			toastID = this._view.displayInfoMessage(`Following ${displayedUser!.name}...`, 0);

			const [followerCount, followeeCount] = await this.follow(authToken!, displayedUser!);

			this._view.setIsFollower(true);
			this._view.setFollowerCount(followerCount);
			this._view.setFolloweeCount(followeeCount);
		}, "follow user");

		this._view.deleteMessage(toastID);
		this._view.setIsLoading(false);
	}

	public async unfollowDisplayedUser(authToken: AuthToken, displayedUser: User): Promise<void> {
		let toastID = "";

		await this.handleFailure(async () => {
			this._view.setIsLoading(true);
			toastID = this._view.displayInfoMessage(`Unfollowing ${displayedUser!.name}...`, 0);

			const [followerCount, followeeCount] = await this.unfollow(authToken!, displayedUser!);

			this._view.setIsFollower(false);
			this._view.setFollowerCount(followerCount);
			this._view.setFolloweeCount(followeeCount);
		}, "unfollow user");

		this._view.deleteMessage(toastID);
		this._view.setIsLoading(false);
	}

	public async follow(authToken: AuthToken, userToFollow: User): Promise<[number, number]> {
		await this._followService.follow(authToken, userToFollow);

		const followerCount = await this.getFollowerCount(authToken, userToFollow);
		const followeeCount = await this.getFolloweeCount(authToken, userToFollow);

		return [followerCount, followeeCount];
	}

	public async unfollow(authToken: AuthToken, userToUnfollow: User): Promise<[number, number]> {
		await this._followService.unfollow(authToken, userToUnfollow);

		const followerCount = await this.getFollowerCount(authToken, userToUnfollow);
		const followeeCount = await this.getFolloweeCount(authToken, userToUnfollow);

		return [followerCount, followeeCount];
	}

	public switchToLoggedInUser(currentUser: User, location: Location): void {
		this._view.setDisplayedUser(currentUser);
		const segments = location.pathname.split("/@");
		const baseURL = segments.length > 1 ? segments[0] : "/";

		this._view.navigate(`${baseURL}/${currentUser!.alias}`);
	}
}
