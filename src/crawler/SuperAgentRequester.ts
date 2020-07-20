import { EventEmitter } from "events";
import * as request from "superagent";
import { IRequester } from "./IRequester";

/**
 * SuperAgent Requester
 */
export class SuperAgentRequester extends EventEmitter implements IRequester {
	private _activeRequests: number = 0;

	/**
	 * create new instance
	 * @param _timeout timeout for each request
	 * @param _maximum_parallelism maximum number of requests to perform simultaneously
	 * @param _parallelism_delay interval between checks for pending requests
	 * @param _gracefulFailure failure will return null instead of throwing an exception
	 */
	constructor(
		private _timeout: number = 15000,
		private _maximum_parallelism: number = 10,
		private _parallelism_delay: number = 50,
		private _gracefulFailure: boolean = false) {
		super();
	}

	/**
	 * Retrieve URL
	 * @param url url to retrieve
	 * @returns contents
	 */
	public async get(url: string): Promise<string> {

		if (this._gracefulFailure) {
			try {
				return await this.getResource(url);
			} catch (e) {
				this.emit("error", e);
				return null;
			}
		} else {
			return await this.getResource(url);
		}

	}

	private async wait(ms: number): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	private async getResource(url: string): Promise<string> {

		while (this._activeRequests > this._maximum_parallelism) {
			await this.wait(this._parallelism_delay);
		}
		this._activeRequests++;

		const response = await request
			.get(url)
			.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
			.set("Accept-Encoding", "gzip, deflate")
			.timeout(this._timeout)
			.buffer(true)
			.parse(request.parse.image);
		this._activeRequests--;
		return response.body;
	}

}
