import {FeedProcessingService} from "../../services/FeedProcessingService";

const feedProcessingService = new FeedProcessingService();

type SqsRecord = {
	body?: string;
};

type SqsEvent = {
	Records?: SqsRecord[];
};

export const updateFeedsHandler = async (event: unknown): Promise<void> => {
	const records = (event as SqsEvent).Records ?? [];

	for (const record of records) {
		if (!record.body) {
			throw new Error("bad-request: missing SQS message body for update feeds handler");
		}

		const {recipientAliases, status} = FeedProcessingService.parseUpdateFeedMessage(record.body);
		await feedProcessingService.applyFeedUpdate(recipientAliases, status);
	}
};
