import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import {AppConfig} from "../../config/AppConfig";

const dynamoClient = new DynamoDBClient({region: AppConfig.region});

export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient, {
	marshallOptions: {
		removeUndefinedValues: true,
	},
});
