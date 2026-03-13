import {Status, User} from "tweeter-shared";

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null;
};

export const getRequiredString = (request: Record<string, unknown>, fieldName: string): string => {
	const value = request[fieldName];

	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`bad-request: missing or invalid '${fieldName}'`);
	}

	return value;
};

export const getOptionalNumber = (request: Record<string, unknown>, fieldName: string, defaultValue: number): number => {
	const value = request[fieldName];
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	return defaultValue;
};

export const getOptionalUser = (request: Record<string, unknown>, fieldName: string): User | null => {
	const value = request[fieldName];
	if (!isRecord(value)) {
		return null;
	}

	const firstName = typeof value._firstName === "string" ? value._firstName : typeof value.firstName === "string" ? value.firstName : undefined;
	const lastName = typeof value._lastName === "string" ? value._lastName : typeof value.lastName === "string" ? value.lastName : undefined;
	const alias = typeof value._alias === "string" ? value._alias : typeof value.alias === "string" ? value.alias : undefined;
	const imageUrl = typeof value._imageUrl === "string" ? value._imageUrl : typeof value.imageUrl === "string" ? value.imageUrl : undefined;

	if (!firstName || !lastName || !alias || !imageUrl) {
		return null;
	}

	return new User(firstName, lastName, alias, imageUrl);
};

export const getOptionalStatus = (request: Record<string, unknown>, fieldName: string): Status | null => {
	const value = request[fieldName];
	if (!isRecord(value)) {
		return null;
	}

	const post = typeof value._post === "string" ? value._post : typeof value.post === "string" ? value.post : undefined;

	const timestamp = typeof value._timestamp === "number" ? value._timestamp : typeof value.timestamp === "number" ? value.timestamp : undefined;

	const userSource = isRecord(value._user) ? value._user : isRecord(value.user) ? value.user : undefined;

	if (!post || typeof timestamp !== "number" || !userSource) {
		return null;
	}

	const user = getOptionalUser({user: userSource}, "user");
	if (user == null) {
		return null;
	}

	return new Status(post, user, timestamp);
};

export const getRequestRecord = (request: unknown): Record<string, unknown> => {
	if (!isRecord(request)) {
		throw new Error("bad-request: request body must be a JSON object");
	}

	return request;
};
