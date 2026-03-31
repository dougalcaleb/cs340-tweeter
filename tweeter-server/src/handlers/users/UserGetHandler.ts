import {UserService} from "../../services/UserService";
import {getRequiredAuthToken, getRequiredString, getRequestRecord} from "../shared/RequestParsing";
import {UserResponse} from "../shared/ResponseTypes";

const userService = new UserService();

export const userGetHandler = async (request: unknown): Promise<UserResponse> => {
	const requestRecord = getRequestRecord(request);
	const authToken = getRequiredAuthToken(requestRecord);
	const alias = getRequiredString(requestRecord, "alias");
	const user = await userService.getUser(authToken, alias);

	return {
		success: true,
		user,
	};
};
