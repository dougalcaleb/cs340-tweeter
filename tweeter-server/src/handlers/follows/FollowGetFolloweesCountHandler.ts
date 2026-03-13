import {FollowService} from "../../services/FollowService";
import {getRequestRecord, getRequiredString} from "../shared/RequestParsing";
import {CountResponse} from "../shared/ResponseTypes";

const followService = new FollowService();

export const followGetFolloweesCountHandler = async (request: unknown): Promise<CountResponse> => {
	const requestRecord = getRequestRecord(request);
	const userAlias = getRequiredString(requestRecord, "userAlias");

	const count = await followService.getFolloweesCount(userAlias);

	return {
		success: true,
		count,
	};
};
