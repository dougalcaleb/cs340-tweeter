import {FollowService} from "../../services/FollowService";
import {getOptionalUser, getRequestRecord} from "../shared/RequestParsing";
import {TweeterResponseBase} from "../shared/ResponseTypes";

const followService = new FollowService();

export const followDeleteHandler = async (request: unknown): Promise<TweeterResponseBase> => {
	const requestRecord = getRequestRecord(request);
	const userToUnfollow = getOptionalUser(requestRecord, "userToUnfollow");

	if (userToUnfollow == null) {
		throw new Error("bad-request: userToUnfollow is required");
	}

	await followService.unfollow(userToUnfollow);

	return {
		success: true,
	};
};
