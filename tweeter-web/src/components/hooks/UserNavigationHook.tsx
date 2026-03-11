import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useNavigate } from "react-router-dom";
import { UserNavHookPresenter, UserNavHookView } from "../../presenters/UserNavHookPresenter";
import { useRef } from "react";

export default function useUserNavigation() {
	const { displayErrorMessage } = useMessageActions();
	const {displayedUser, authToken} = useUserInfo();
	const { setDisplayedUser } = useUserInfoActions();
	const navigate = useNavigate();

	const viewObserver: UserNavHookView = {
		setDisplayedUser,
		displayErrorMessage,
		navigate,
	};
	const presenter = useRef<UserNavHookPresenter | null>(null);
	if (!presenter.current) {
		presenter.current = new UserNavHookPresenter(viewObserver);
	}
	
	const navigateToUser = async (event: React.MouseEvent, featurePath: string): Promise<void> => {
		event.preventDefault();
		presenter.current?.navigateToUser(authToken!, displayedUser!, event.target.toString(), featurePath);
	};

	return navigateToUser;
}