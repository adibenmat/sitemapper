import { ISiteMap } from "./ISiteMapIndex";
import { ISiteMapUrl } from "./ISiteMapUrl";

export interface ISiteMapperResult {
	url: string;
	sitemaps: ISiteMapperMap[];
}

export interface ISiteMapperMap extends ISiteMap {
	urls: ISiteMapUrl[];
}
