import { useContext } from "react";
import { ToastType } from "./Toast";
import { ToastActionsContext, ToastListContext } from "./ToastContexts";

interface MessageActions {
	displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => string;
	displayErrorMessage: (message: string, bootstrapClasses?: string) => string;
	deleteMessage: (messageID: string) => void;
	deleteAllMessages: () => void;
}

export function useMessageActions(): MessageActions {
	const { displayToast, deleteToast, deleteAllToasts } = useContext(ToastActionsContext);
	
	return {
		displayInfoMessage(message: string, duration: number, bootstrapClasses?: string) {
			return displayToast(ToastType.Info, message, duration, undefined, bootstrapClasses);
		},
		displayErrorMessage(message: string, bootstrapClasses?: string) {
			return displayToast(ToastType.Error, message, 0, undefined, bootstrapClasses);
		},
		deleteAllMessages: deleteAllToasts,
		deleteMessage: deleteToast
	}
}

export function useMessageList() {
	return useContext(ToastListContext);
}