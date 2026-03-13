import {FollowService} from "../../services/FollowService";
import {getOptionalNumber, getOptionalUser, getRequestRecord, getRequiredString} from "../shared/RequestParsing";
import {UserPageResponse} from "../shared/ResponseTypes";

const followService = new FollowService();

export const followListFollowersHandler = async (request: unknown): Promise<UserPageResponse> => {
	const requestRecord = getRequestRecord(request);
	const userAlias = getRequiredString(requestRecord, "userAlias");
	const pageSize = getOptionalNumber(requestRecord, "pageSize", 10);
	const lastItem = getOptionalUser(requestRecord, "lastItem");

	const [items, hasMore] = await followService.listFollowers(userAlias, pageSize, lastItem);

	return {
		success: true,
		items,
		hasMore,
	};
};
