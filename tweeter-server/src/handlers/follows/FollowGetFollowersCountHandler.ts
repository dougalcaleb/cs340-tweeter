import {FollowService} from "../../services/FollowService";
import {getRequestRecord, getRequiredAuthToken, getRequiredString} from "../shared/RequestParsing";
import {CountResponse} from "../shared/ResponseTypes";

const followService = new FollowService();

export const followGetFollowersCountHandler = async (request: unknown): Promise<CountResponse> => {
	const requestRecord = getRequestRecord(request);
	const authToken = getRequiredAuthToken(requestRecord);
	const userAlias = getRequiredString(requestRecord, "userAlias");

	const count = await followService.getFollowersCount(authToken, userAlias);

	return {
		success: true,
		count,
	};
};
