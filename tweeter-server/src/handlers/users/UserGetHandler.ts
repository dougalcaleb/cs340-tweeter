import {UserService} from "../../services/UserService";
import {getRequiredString, getRequestRecord} from "../shared/RequestParsing";
import {UserResponse} from "../shared/ResponseTypes";

const userService = new UserService();

export const userGetHandler = async (request: unknown): Promise<UserResponse> => {
	const requestRecord = getRequestRecord(request);
	const alias = getRequiredString(requestRecord, "alias");
	const user = await userService.getUser(alias);

	return {
		success: true,
		user,
	};
};
