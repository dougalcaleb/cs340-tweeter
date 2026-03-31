import {ObjectCannedACL, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {AppConfig} from "../../config/AppConfig";
import {ImageDao} from "../interfaces/ImageDao";

export class S3ImageDao implements ImageDao {
	private readonly client = new S3Client({region: AppConfig.region});

	public async putImage(fileName: string, imageStringBase64Encoded: string, contentType: string): Promise<string> {
		const decodedImageBuffer = Buffer.from(imageStringBase64Encoded, "base64");
		const putObjectCommand = new PutObjectCommand({
			Bucket: AppConfig.userImageBucketName,
			Key: `image/${fileName}`,
			Body: decodedImageBuffer,
			ContentType: contentType,
			ACL: ObjectCannedACL.public_read,
		});

		await this.client.send(putObjectCommand);
		return `https://${AppConfig.userImageBucketName}.s3.${AppConfig.region}.amazonaws.com/image/${fileName}`;
	}
}
