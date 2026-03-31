export interface FollowDao {
	isFollower(followerAlias: string, followeeAlias: string): Promise<boolean>;
	listFollowerAliases(userAlias: string, pageSize: number, lastFollowerAlias: string | null): Promise<[string[], boolean]>;
	listFolloweeAliases(userAlias: string, pageSize: number, lastFolloweeAlias: string | null): Promise<[string[], boolean]>;
	getFollowerCount(userAlias: string): Promise<number>;
	getFolloweeCount(userAlias: string): Promise<number>;
	putFollow(followerAlias: string, followeeAlias: string): Promise<void>;
	deleteFollow(followerAlias: string, followeeAlias: string): Promise<void>;
}
