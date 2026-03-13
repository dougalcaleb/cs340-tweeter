import {User} from "tweeter-shared";
import {FollowService} from "../../services/FollowService";
import {getOptionalUser, getRequestRecord} from "../shared/RequestParsing";
import {IsFollowerResponse} from "../shared/ResponseTypes";

const followService = new FollowService();

export const followIsFollowerHandler = async (request: unknown): Promise<IsFollowerResponse> => {
	const requestRecord = getRequestRecord(request);

	const user = getOptionalUser(requestRecord, "user");
	const selectedUser = getOptionalUser(requestRecord, "selectedUser");

	if (user == null || selectedUser == null) {
		throw new Error("bad-request: user and selectedUser are required");
	}

	const isFollower = await followService.isFollower(user as User, selectedUser as User);

	return {
		success: true,
		isFollower,
	};
};
