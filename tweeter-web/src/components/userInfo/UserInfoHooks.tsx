import { useContext } from "react";
import { UserInfoActionsContext, UserInfoContext } from "./UserInfoContexts";


export function useUserInfo() {
	return useContext(UserInfoContext);
}

export function useUserInfoActions() {
	return useContext(UserInfoActionsContext);
}