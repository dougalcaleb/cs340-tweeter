import {StatusService} from "../../services/StatusService";
import {getOptionalStatus, getRequestRecord, getRequiredAuthToken} from "../shared/RequestParsing";
import {TweeterResponseBase} from "../shared/ResponseTypes";

const statusService = new StatusService();

export const statusCreateHandler = async (request: unknown): Promise<TweeterResponseBase> => {
	const requestRecord = getRequestRecord(request);
	const authToken = getRequiredAuthToken(requestRecord);
	const newStatus = getOptionalStatus(requestRecord, "newStatus");

	if (newStatus == null) {
		throw new Error("bad-request: newStatus is required");
	}

	await statusService.createStatus(authToken, newStatus);

	return {
		success: true,
	};
};
