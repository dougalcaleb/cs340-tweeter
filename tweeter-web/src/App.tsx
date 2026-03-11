import "./App.css";
import {BrowserRouter, Navigate, Route, Routes, useLocation} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import {useUserInfo} from "./components/userInfo/UserInfoHooks";
import {FolloweePresenter} from "./presenters/FolloweePresenter";
import {FollowerPresenter} from "./presenters/FollowerPresenter";
import {FeedPresenter} from "./presenters/FeedPresenter";
import {StoryPresenter} from "./presenters/StoryPresenter";
import ItemScroller from "./components/mainLayout/ItemScroller";
import {PagedItemView} from "./presenters/PagedItemPresenter";
import {Status, User} from "tweeter-shared";
import UserItem from "./components/userItem/UserItem";
import StatusItem from "./components/statusItem/StatusItem";

const App = () => {
	const {currentUser, authToken} = useUserInfo();

	const isAuthenticated = (): boolean => {
		return !!currentUser && !!authToken;
	};

	return (
		<div>
			<Toaster position="top-right" />
			<BrowserRouter>{isAuthenticated() ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}</BrowserRouter>
		</div>
	);
};

const AuthenticatedRoutes = () => {
	const {displayedUser} = useUserInfo();
	const statusItemFactory = (item: Status, featurePath: string) => <StatusItem item={item} featurePath={featurePath}  />;
	const userItemFactory = (item: User, featurePath: string) => <UserItem user={item} featurePath={featurePath} />;

	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
				<Route
					path="feed/:displayedUser"
					element={
						<ItemScroller<Status>
							key={`feed-${displayedUser?.alias}`}
							presenterFactory={(ob: PagedItemView<Status>) => new FeedPresenter(ob)}
							itemComponentFactory={statusItemFactory}
							featurePath="/feed"
						/>
					}
				/>
				<Route
					path="story/:displayedUser"
					element={
						<ItemScroller<Status>
							key={`story-${displayedUser?.alias}`}
							presenterFactory={(ob: PagedItemView<Status>) => new StoryPresenter(ob)}
							itemComponentFactory={statusItemFactory}
							featurePath="/story"
						/>
					}
				/>
				<Route
					path="followees/:displayedUser"
					element={
						<ItemScroller<User>
							key={`followees-${displayedUser?.alias}`}
							presenterFactory={(ob: PagedItemView<User>) => new FolloweePresenter(ob)}
							itemComponentFactory={userItemFactory}
							featurePath="/followees"
						/>
					}
				/>
				<Route
					path="followers/:displayedUser"
					element={
						<ItemScroller<User>
							key={`followers-${displayedUser?.alias}`}
							presenterFactory={(ob: PagedItemView<User>) => new FollowerPresenter(ob)}
							itemComponentFactory={userItemFactory}
							featurePath="/followers"
						/>
					}
				/>
				<Route path="logout" element={<Navigate to="/login" />} />
				<Route path="*" element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
			</Route>
		</Routes>
	);
};

const UnauthenticatedRoutes = () => {
	const location = useLocation();

	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="*" element={<Login originalUrl={location.pathname} />} />
		</Routes>
	);
};

export default App;
