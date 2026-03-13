import {UserService} from "../../services/UserService";
import {getRequiredString, getRequestRecord} from "../shared/RequestParsing";
import {AuthUserResponse} from "../shared/ResponseTypes";

const userService = new UserService();

export const userLoginHandler = async (request: unknown): Promise<AuthUserResponse> => {
	const requestRecord = getRequestRecord(request);
	const alias = getRequiredString(requestRecord, "alias");
	const password = getRequiredString(requestRecord, "password");

	const [user, authToken] = await userService.loginUser(alias, password);

	return {
		success: true,
		user,
		authToken,
	};
};
