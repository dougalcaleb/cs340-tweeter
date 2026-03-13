import {FollowService} from "../../services/FollowService";
import {getOptionalUser, getRequestRecord} from "../shared/RequestParsing";
import {TweeterResponseBase} from "../shared/ResponseTypes";

const followService = new FollowService();

export const followCreateHandler = async (request: unknown): Promise<TweeterResponseBase> => {
	const requestRecord = getRequestRecord(request);
	const userToFollow = getOptionalUser(requestRecord, "userToFollow");

	if (userToFollow == null) {
		throw new Error("bad-request: userToFollow is required");
	}

	await followService.follow(userToFollow);

	return {
		success: true,
	};
};
