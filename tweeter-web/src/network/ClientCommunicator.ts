export class ClientCommunicator {
	private readonly serverUrl: string;

	public constructor(serverUrl: string) {
		this.serverUrl = serverUrl;
	}

	public async doPost<REQ extends object, RES extends object>(req: REQ, endpoint: string, headers?: Headers): Promise<RES> {
		const resolvedHeaders = headers ?? new Headers();
		resolvedHeaders.set("Content-type", "application/json");

		const response = await fetch(this.getUrl(endpoint), {
			method: "POST",
			headers: resolvedHeaders,
			body: JSON.stringify(req),
		});

		const payload = await response.json();

		if (!response.ok) {
			const serverMessage = payload?.message ?? payload?.error ?? "Request failed";
			throw new Error(serverMessage);
		}

		return payload as RES;
	}

	private getUrl(endpoint: string): string {
		const normalizedBase = this.serverUrl.endsWith("/") ? this.serverUrl.slice(0, -1) : this.serverUrl;
		return `${normalizedBase}${endpoint}`;
	}
}
