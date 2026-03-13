import {UserService} from "../../services/UserService";
import {getRequiredString, getRequestRecord} from "../shared/RequestParsing";
import {TweeterResponseBase} from "../shared/ResponseTypes";

const userService = new UserService();

export const userLogoutHandler = async (request: unknown): Promise<TweeterResponseBase> => {
	const requestRecord = getRequestRecord(request);
	const authToken = getRequiredString(requestRecord, "authToken");

	await userService.logoutUser(authToken);

	return {
		success: true,
	};
};
