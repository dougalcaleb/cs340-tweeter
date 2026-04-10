import {FeedProcessingService} from "../../services/FeedProcessingService";

const feedProcessingService = new FeedProcessingService();

type SqsRecord = {
	body?: string;
};

type SqsEvent = {
	Records?: SqsRecord[];
};

export const postUpdateFeedMessagesHandler = async (event: unknown): Promise<void> => {
	const records = (event as SqsEvent).Records ?? [];

	for (const record of records) {
		if (!record.body) {
			throw new Error("bad-request: missing SQS message body for post update feed messages handler");
		}

		const {authorAlias, status} = FeedProcessingService.parsePostStatusMessage(record.body);
		await feedProcessingService.enqueueFeedUpdateMessages(authorAlias, status);
	}
};
