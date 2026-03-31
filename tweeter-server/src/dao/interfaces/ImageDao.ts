export interface ImageDao {
	putImage(fileName: string, imageStringBase64Encoded: string, contentType: string): Promise<string>;
}
