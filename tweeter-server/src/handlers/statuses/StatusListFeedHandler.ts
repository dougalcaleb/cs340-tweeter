import {StatusService} from "../../services/StatusService";
import {getOptionalNumber, getOptionalStatus, getRequestRecord, getRequiredString} from "../shared/RequestParsing";
import {StatusPageResponse} from "../shared/ResponseTypes";

const statusService = new StatusService();

export const statusListFeedHandler = async (request: unknown): Promise<StatusPageResponse> => {
	const requestRecord = getRequestRecord(request);
	const userAlias = getRequiredString(requestRecord, "userAlias");
	const pageSize = getOptionalNumber(requestRecord, "pageSize", 10);
	const lastItem = getOptionalStatus(requestRecord, "lastItem");

	const [items, hasMore] = await statusService.listFeedItems(userAlias, pageSize, lastItem);

	return {
		success: true,
		items,
		hasMore,
	};
};
