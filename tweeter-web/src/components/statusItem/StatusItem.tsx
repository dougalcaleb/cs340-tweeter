import { Link } from "react-router-dom";
import { Status } from "tweeter-shared";
import Post from "./Post";
import useUserNavigation from "../hooks/UserNavigationHook";

interface Props {
	item: Status,
	featurePath: string
}

export default function StatusItem(props: Props)
{
	const navigateToUser = useUserNavigation();
	
	return (
		<div className="row mb-3 mx-0 px-0 border rounded bg-white">
			<div className="col bg-light mx-0 px-0">
				<div className="container px-0">
					<div className="row mx-0 px-0">
						<div className="col-auto p-3">
							<img src={props.item.user.imageUrl} className="img-fluid" width="80" alt="Posting user" />
						</div>
						<div className="col">
							<h2>
								<b>
									{props.item.user.firstName} {props.item.user.lastName}
								</b>{" "}
								-{" "}
								<Link to={`${props.featurePath}/${props.item.user.alias}`} onClick={(ev) => navigateToUser(ev, props.featurePath)}>
									{props.item.user.alias}
								</Link>
							</h2>
							{props.item.formattedDate}
							<br />
							<Post status={props.item} featurePath={props.featurePath} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
