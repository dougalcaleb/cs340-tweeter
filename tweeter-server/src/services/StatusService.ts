import {Status} from "tweeter-shared";
import {DaoFactory, daoFactory} from "../dao/DaoFactory";
import {FeedDao} from "../dao/interfaces/FeedDao";
import {FollowDao} from "../dao/interfaces/FollowDao";
import {StatusDao} from "../dao/interfaces/StatusDao";
import {AuthorizationService} from "./AuthorizationService";

export class StatusService {
	private readonly statusDao: StatusDao;
	private readonly feedDao: FeedDao;
	private readonly followDao: FollowDao;
	private readonly authorizationService: AuthorizationService;

	public constructor(factory: DaoFactory = daoFactory) {
		this.statusDao = factory.createStatusDao();
		this.feedDao = factory.createFeedDao();
		this.followDao = factory.createFollowDao();
		this.authorizationService = new AuthorizationService(factory);
	}

	public async listStoryItems(authToken: string, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		await this.authorizationService.requireAuthorization(authToken);
		if (userAlias.length === 0) {
			throw new Error("bad-request: user alias is required");
		}

		return this.statusDao.listStoryStatuses(userAlias, pageSize, lastItem?.timestamp ?? null);
	}

	public async listFeedItems(authToken: string, userAlias: string, pageSize: number, lastItem: Status | null): Promise<[Status[], boolean]> {
		await this.authorizationService.requireAuthorization(authToken);
		if (userAlias.length === 0) {
			throw new Error("bad-request: user alias is required");
		}

		return this.feedDao.listFeedStatuses(userAlias, pageSize, lastItem?.timestamp ?? null);
	}

	public async createStatus(authToken: string, newStatus: Status): Promise<void> {
		const authorAlias = await this.authorizationService.requireAuthorization(authToken);
		if (newStatus.post.length === 0) {
			throw new Error("bad-request: status content is required");
		}

		if (newStatus.user.alias !== authorAlias) {
			throw new Error("unauthorized: auth token does not match status author");
		}

		await this.statusDao.putStatus(newStatus);
		const followerAliases = await this.getAllFollowerAliases(authorAlias);
		await this.feedDao.batchPutFeedStatuses(followerAliases, newStatus);
	}

	private async getAllFollowerAliases(authorAlias: string): Promise<string[]> {
		const allFollowers: string[] = [];
		let lastFollowerAlias: string | null = null;
		let hasMore = true;

		while (hasMore) {
			const [followerAliases, pageHasMore] = await this.followDao.listFollowerAliases(authorAlias, 100, lastFollowerAlias);
			allFollowers.push(...followerAliases);
			hasMore = pageHasMore;
			if (followerAliases.length > 0) {
				lastFollowerAlias = followerAliases[followerAliases.length - 1] ?? null;
			} else {
				lastFollowerAlias = null;
			}
		}

		return allFollowers;
	}
}
