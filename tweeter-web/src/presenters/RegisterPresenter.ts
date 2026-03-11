import {Dispatch, SetStateAction} from "react";
import {Buffer} from "buffer";
import {LoginView, UserAccountPresenter} from "./UserAccountPresenter";

export interface RegisterView extends LoginView
{
	setImageUrl: Dispatch<SetStateAction<string>>;
	setImageBytes: Dispatch<SetStateAction<Uint8Array>>;
	setImageFileExtension: Dispatch<SetStateAction<string>>;
}

export class RegisterPresenter extends UserAccountPresenter<RegisterView>
{
	public async doRegister(
		firstName: string,
		lastName: string,
		alias: string,
		password: string,
		imageBytes: Uint8Array,
		fileExt: string,
		rememberMe: boolean,
	): Promise<void> {
		return await this.setupUserAccount(
			rememberMe,
			null,
			() => this._userService.registerUser(firstName, lastName, alias, password, imageBytes, fileExt),
			"register",
		);
	}

	public handleImageFile(file: File | undefined): void {
		if (file) {
			this._view.setImageUrl(URL.createObjectURL(file));

			const reader = new FileReader();
			reader.onload = (event: ProgressEvent<FileReader>) => {
				const imageStringBase64 = event.target?.result as string;

				// Remove unnecessary file metadata from the start of the string.
				const imageStringBase64BufferContents = imageStringBase64.split("base64,")[1];

				const bytes: Uint8Array = Buffer.from(imageStringBase64BufferContents, "base64");

				this._view.setImageBytes(bytes);
			};
			reader.readAsDataURL(file);

			const fileExtension = file.name.split(".").pop();
			if (fileExtension) {
				this._view.setImageFileExtension(fileExtension);
			}
		} else {
			this._view.setImageUrl("");
			this._view.setImageBytes(new Uint8Array());
		}
	}
}
