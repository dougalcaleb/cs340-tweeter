import {DynamoAuthTokenDao} from "./dynamodb/DynamoAuthTokenDao";
import {DynamoFeedDao} from "./dynamodb/DynamoFeedDao";
import {DynamoFollowDao} from "./dynamodb/DynamoFollowDao";
import {DynamoStatusDao} from "./dynamodb/DynamoStatusDao";
import {DynamoUserDao} from "./dynamodb/DynamoUserDao";
import {S3ImageDao} from "./s3/S3ImageDao";
import {AuthTokenDao} from "./interfaces/AuthTokenDao";
import {FeedDao} from "./interfaces/FeedDao";
import {FollowDao} from "./interfaces/FollowDao";
import {ImageDao} from "./interfaces/ImageDao";
import {StatusDao} from "./interfaces/StatusDao";
import {UserDao} from "./interfaces/UserDao";

export interface DaoFactory {
	createUserDao(): UserDao;
	createAuthTokenDao(): AuthTokenDao;
	createFollowDao(): FollowDao;
	createStatusDao(): StatusDao;
	createFeedDao(): FeedDao;
	createImageDao(): ImageDao;
}

class DynamoDaoFactory implements DaoFactory {
	private readonly userDao = new DynamoUserDao();
	private readonly authTokenDao = new DynamoAuthTokenDao();
	private readonly followDao = new DynamoFollowDao();
	private readonly statusDao = new DynamoStatusDao();
	private readonly feedDao = new DynamoFeedDao();
	private readonly imageDao = new S3ImageDao();

	public createUserDao(): UserDao {
		return this.userDao;
	}

	public createAuthTokenDao(): AuthTokenDao {
		return this.authTokenDao;
	}

	public createFollowDao(): FollowDao {
		return this.followDao;
	}

	public createStatusDao(): StatusDao {
		return this.statusDao;
	}

	public createFeedDao(): FeedDao {
		return this.feedDao;
	}

	public createImageDao(): ImageDao {
		return this.imageDao;
	}
}

export const daoFactory: DaoFactory = new DynamoDaoFactory();
