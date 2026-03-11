import InfiniteScroll from "react-infinite-scroll-component";
import {useEffect, useRef, useState} from "react";
import {useUserInfo, useUserInfoActions} from "../userInfo/UserInfoHooks";
import {useMessageActions} from "../toaster/MessageHooks";
import {useParams} from "react-router-dom";
import {PagedItemPresenter, PagedItemView} from "../../presenters/PagedItemPresenter";

interface Props<T> {
	featurePath: string,
	presenterFactory: (observer: PagedItemView<T>) => PagedItemPresenter<T>;
	itemComponentFactory: (item: T, featurePath: string) => JSX.Element
}

export default function ItemScroller<T>(props: Props<T>) {
	// Context
	const {displayedUser, authToken} = useUserInfo();
	const {displayErrorMessage} = useMessageActions();
	const {displayedUser: displayedUserAliasParam} = useParams();
	// State
	const [items, setItems] = useState<T[]>([]);
	const {setDisplayedUser} = useUserInfoActions();
	// Presenter
	const viewObserver: PagedItemView<T> = {
		addItems: (newItems: T[]) => setItems((prev) => [...prev, ...newItems]),
		displayErrorMessage,
	};
	const presenter = useRef<PagedItemPresenter<T> | null>(null);
	if (!presenter.current) {
		presenter.current = props.presenterFactory(viewObserver);
	}

	const loadMoreItems = () => presenter.current!.loadMoreItems(authToken!, displayedUser!.alias);

	// Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
	useEffect(() => {
		if (authToken && displayedUserAliasParam && displayedUserAliasParam != displayedUser!.alias) {
			presenter.current!.getUser(authToken!, displayedUserAliasParam!).then((toUser) => {
				if (toUser) {
					setDisplayedUser(toUser);
				}
			});
		}
	}, [displayedUserAliasParam]);

	const reset = async () => {
		setItems(() => []);
		presenter.current!.reset();
	};

	// Initialize the component whenever the displayed user changes
	useEffect(() => {
		reset();
		loadMoreItems();
	}, [displayedUser]);

	return (
		<div className="container px-0 overflow-visible vh-100">
			<InfiniteScroll
				className="pr-0 mr-0"
				dataLength={items.length}
				next={loadMoreItems}
				hasMore={presenter.current!.hasMoreItems}
				loader={<h4>Loading...</h4>}
			>
				{items.map((item, index) => (
					<div key={index} className="row mb-3 mx-0 px-0 border rounded bg-white">
						{props.itemComponentFactory(item, props.featurePath)}
					</div>
				))}
			</InfiniteScroll>
		</div>
	);
}
