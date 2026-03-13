import {UserService} from "../../services/UserService";
import {getRequiredString, getRequestRecord} from "../shared/RequestParsing";
import {AuthUserResponse} from "../shared/ResponseTypes";

const userService = new UserService();

export const userRegisterHandler = async (request: unknown): Promise<AuthUserResponse> => {
	const requestRecord = getRequestRecord(request);

	const firstName = getRequiredString(requestRecord, "firstName");
	const lastName = getRequiredString(requestRecord, "lastName");
	const alias = getRequiredString(requestRecord, "alias");
	const password = getRequiredString(requestRecord, "password");
	const imageBase64 = getRequiredString(requestRecord, "userImageBase64");
	const fileExt = getRequiredString(requestRecord, "fileExtension");

	const [user, authToken] = await userService.registerUser(firstName, lastName, alias, password, imageBase64, fileExt);

	return {
		success: true,
		user,
		authToken,
	};
};
