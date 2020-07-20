import { IRequester } from "./crawler/IRequester";

export interface ISitemapperOptions {
	url?: string;
	timeout?: number;
	requester?: IRequester;
}
