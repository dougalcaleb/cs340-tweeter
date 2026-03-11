import { Status } from "tweeter-shared";
import { StatusService } from "../services/StatusService";
import { PagedItemPresenter, PagedItemView } from "./PagedItemPresenter";

export abstract class StatusItemPresenter extends PagedItemPresenter<Status>
{
	protected _statusService: StatusService;

	public constructor(view: PagedItemView<Status>) {
		super(view);
		this._statusService = new StatusService();
	}
}
