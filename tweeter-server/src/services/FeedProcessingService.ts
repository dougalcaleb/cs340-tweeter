import {SendMessageBatchCommand, SendMessageBatchRequestEntry, SQSClient} from "@aws-sdk/client-sqs";
import {Status} from "tweeter-shared";
import {AppConfig} from "../config/AppConfig";
import {DaoFactory, daoFactory} from "../dao/DaoFactory";
import {FeedDao} from "../dao/interfaces/FeedDao";
import {FollowDao} from "../dao/interfaces/FollowDao";

type PostStatusMessageBody = {
	authorAlias: string;
	statusJson: string;
};

type UpdateFeedMessageBody = {
	recipientAliases: string[];
	statusJson: string;
};

const FOLLOWERS_PAGE_SIZE = 500;
const SQS_BATCH_SIZE = 10;

export class FeedProcessingService {
	private readonly followDao: FollowDao;
	private readonly feedDao: FeedDao;
	private readonly sqsClient: SQSClient;

	public constructor(factory: DaoFactory = daoFactory) {
		this.followDao = factory.createFollowDao();
		this.feedDao = factory.createFeedDao();
		this.sqsClient = new SQSClient({region: AppConfig.region});
	}

	public static buildPostStatusMessage(authorAlias: string, status: Status): string {
		return JSON.stringify({
			authorAlias,
			statusJson: status.toJson(),
		} satisfies PostStatusMessageBody);
	}

	public static parsePostStatusMessage(messageBody: string): {authorAlias: string; status: Status} {
		const parsed = JSON.parse(messageBody) as Partial<PostStatusMessageBody>;
		if (!parsed.authorAlias || !parsed.statusJson) {
			throw new Error("bad-request: invalid post status queue message payload");
		}

		const status = Status.fromJson(parsed.statusJson);
		if (status == null) {
			throw new Error("bad-request: invalid post status queue status payload");
		}

		return {
			authorAlias: parsed.authorAlias,
			status,
		};
	}

	public static buildUpdateFeedMessage(recipientAliases: string[], status: Status): string {
		return JSON.stringify({
			recipientAliases,
			statusJson: status.toJson(),
		} satisfies UpdateFeedMessageBody);
	}

	public static parseUpdateFeedMessage(messageBody: string): {recipientAliases: string[]; status: Status} {
		const parsed = JSON.parse(messageBody) as Partial<UpdateFeedMessageBody>;
		if (!parsed.statusJson || !Array.isArray(parsed.recipientAliases)) {
			throw new Error("bad-request: invalid update feed queue message payload");
		}

		const status = Status.fromJson(parsed.statusJson);
		if (status == null) {
			throw new Error("bad-request: invalid update feed queue status payload");
		}

		const recipientAliases = parsed.recipientAliases.filter(
			(alias): alias is string => typeof alias === "string" && alias.length > 0,
		);

		if (recipientAliases.length !== parsed.recipientAliases.length) {
			throw new Error("bad-request: invalid recipient aliases in update feed queue message payload");
		}

		return {
			recipientAliases,
			status,
		};
	}

	public async enqueueFeedUpdateMessages(authorAlias: string, status: Status): Promise<void> {
		let lastFollowerAlias: string | null = null;
		let hasMore = true;
		let nextMessageId = 0;
		let messageBatch: SendMessageBatchRequestEntry[] = [];

		while (hasMore) {
			const [followerAliases, pageHasMore] = await this.followDao.listFollowerAliases(authorAlias, FOLLOWERS_PAGE_SIZE, lastFollowerAlias);
			hasMore = pageHasMore;

			if (followerAliases.length > 0) {
				messageBatch.push({
					Id: `${nextMessageId}`,
					MessageBody: FeedProcessingService.buildUpdateFeedMessage(followerAliases, status),
				});
				nextMessageId += 1;

				lastFollowerAlias = followerAliases[followerAliases.length - 1] ?? null;
			} else {
				lastFollowerAlias = null;
			}

			if (messageBatch.length >= SQS_BATCH_SIZE) {
				await this.flushQueueMessageBatch(messageBatch);
				messageBatch = [];
			}
		}

		if (messageBatch.length > 0) {
			await this.flushQueueMessageBatch(messageBatch);
		}
	}

	public async applyFeedUpdate(recipientAliases: string[], status: Status): Promise<void> {
		if (recipientAliases.length === 0) {
			return;
		}

		await this.feedDao.batchPutFeedStatuses(recipientAliases, status);
	}

	private async flushQueueMessageBatch(messageBatch: SendMessageBatchRequestEntry[]): Promise<void> {
		const output = await this.sqsClient.send(
			new SendMessageBatchCommand({
				QueueUrl: AppConfig.updateFeedQueueUrl,
				Entries: messageBatch,
			}),
		);

		if ((output.Failed?.length ?? 0) > 0) {
			throw new Error("internal-server-error: failed to queue one or more update feed messages");
		}
	}
}
