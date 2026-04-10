import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import {Status} from "tweeter-shared";
import {AppConfig} from "../config/AppConfig";
import {DaoFactory, daoFactory} from "../dao/DaoFactory";
import {FeedDao} from "../dao/interfaces/FeedDao";
import {StatusDao} from "../dao/interfaces/StatusDao";
import {AuthorizationService} from "./AuthorizationService";

export class StatusService {
	private readonly statusDao: StatusDao;
	private readonly feedDao: FeedDao;
	private readonly authorizationService: AuthorizationService;
	private readonly sqsClient: SQSClient;

	public constructor(factory: DaoFactory = daoFactory) {
		this.statusDao = factory.createStatusDao();
		this.feedDao = factory.createFeedDao();
		this.authorizationService = new AuthorizationService(factory);
		this.sqsClient = new SQSClient({region: AppConfig.region});
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

		const messageBody = JSON.stringify({
			authorAlias,
			statusJson: newStatus.toJson(),
		});
		try {
			await this.sqsClient.send(
				new SendMessageCommand({
					QueueUrl: AppConfig.postStatusQueueUrl,
					MessageBody: messageBody,
				}),
			);
		} catch {
			throw new Error("internal-server-error: failed to queue status for feed updates");
		}
	}
}
