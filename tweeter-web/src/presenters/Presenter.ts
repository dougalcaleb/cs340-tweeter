export interface View
{
	displayErrorMessage: (message: string) => void,
}

export interface MessageView extends View
{
	displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string | undefined) => string,
	deleteMessage: (messageID: string) => void,
}

export abstract class Presenter<V extends View>
{
	protected _view: V;

	protected constructor(view: V) {
		this._view = view;
	}

	protected async handleFailure(operation: () => Promise<any>, description: string): Promise<void>
	{
		try {
			await operation();
		} catch (error) {
			this._view.displayErrorMessage(`Failed to ${description}`);
		}
	}
}