import {FollowService} from "../../services/FollowService";
import {getOptionalNumber, getOptionalUser, getRequiredAuthToken, getRequestRecord, getRequiredString} from "../shared/RequestParsing";
import {UserPageResponse} from "../shared/ResponseTypes";

const followService = new FollowService();

export const followListFollowersHandler = async (request: unknown): Promise<UserPageResponse> => {
	const requestRecord = getRequestRecord(request);
	const authToken = getRequiredAuthToken(requestRecord);
	const userAlias = getRequiredString(requestRecord, "userAlias");
	const pageSize = getOptionalNumber(requestRecord, "pageSize", 10);
	const lastItem = getOptionalUser(requestRecord, "lastItem");

	const [items, hasMore] = await followService.listFollowers(authToken, userAlias, pageSize, lastItem);

	return {
		success: true,
		items,
		hasMore,
	};
};
