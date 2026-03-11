import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import {KeyboardEvent, useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import { LoginPresenter } from "../../../presenters/LoginPresenter";
import { LoginView } from "../../../presenters/UserAccountPresenter";

interface Props {
	originalUrl?: string;
	presenter?: LoginPresenter;
}

const Login = (props: Props) => {
	const [alias, setAlias] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const { updateUserInfo } = useUserInfoActions();
	const { displayErrorMessage } = useMessageActions();
	
	const viewObserver: LoginView = {
		setIsLoading,
		updateUserInfo,
		navigate,
		displayErrorMessage,
	};
	const presenter = useRef<LoginPresenter | null>(null);
	if (!presenter.current) {
		presenter.current = props.presenter ?? new LoginPresenter(viewObserver);
	}

	useEffect(() => {
		presenter.current = props.presenter ?? new LoginPresenter(viewObserver);
	}, [rememberMe]);

	const checkSubmitButtonStatus = (): boolean => {
		return !alias || !password;
	};

	const loginOnEnter = (ev: KeyboardEvent<HTMLElement>) => presenter.current?.loginOnEnter(ev.key, alias, password, rememberMe, props.originalUrl || '');
	const doLogin = () => presenter.current?.doLogin(alias, password, rememberMe, props.originalUrl || '');

	const inputFieldFactory = () => <AuthenticationFields onEnter={loginOnEnter} setAlias={setAlias} setPassword={setPassword} />;
	const switchAuthenticationMethodFactory = () => <div className="mb-3">Not registered? <Link to="/register">Register</Link></div>;

	return (
		<AuthenticationFormLayout
			headingText="Please Sign In"
			submitButtonLabel="Sign in"
			oAuthHeading="Sign in with:"
			inputFieldFactory={inputFieldFactory}
			switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
			setRememberMe={setRememberMe}
			submitButtonDisabled={checkSubmitButtonStatus}
			isLoading={isLoading}
			submit={doLogin}
		/>
	);
};

export default Login;
