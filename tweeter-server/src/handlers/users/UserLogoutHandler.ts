import {UserService} from "../../services/UserService";
import {getRequiredAuthToken, getRequestRecord} from "../shared/RequestParsing";
import {TweeterResponseBase} from "../shared/ResponseTypes";

const userService = new UserService();

export const userLogoutHandler = async (request: unknown): Promise<TweeterResponseBase> => {
	const requestRecord = getRequestRecord(request);
	const authToken = getRequiredAuthToken(requestRecord);

	await userService.logoutUser(authToken);

	return {
		success: true,
	};
};
