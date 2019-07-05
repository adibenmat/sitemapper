/**
 * Sitemap Parser
 *
 * Copyright (c) 2014 Sean Thomas Burke
 * Licensed under the MIT license.
 * @author Sean Burke <hawaiianchimp@gmail.com>
 */

import * as request from "superagent";
import * as xmlParse from "xml2js";
import { ISiteMapperResult } from "./ISiteMapperIndex";
import { ISitemapperOptions } from "./ISitemapperOptions";
import { ISitemapperResponse } from "./ISitemapperResponse";

/**
 * Sitemapper
 */
export default class Sitemapper {

	/**
	 * Get the timeout
	 *
	 * @example
	 * console.log(sitemapper.timeout);
	 * @returns {number} timeout
	 */
	public get timeout() {
		return this._timeout;
	}

	/**
	 * Set the timeout
	 *
	 * @public
	 * @param {Timeout} duration
	 * @example
	 * sitemapper.timeout = 15000; // 15 seconds
	 */
	public set timeout(duration) {
		this._timeout = duration;
	}

	/**
	 *
	 * @param {string} url - url for making requests. Should be a link to a sitemaps.xml
	 * @example
	 * sitemapper.url = 'http://wp.seantburke.com/sitemap.xml'
	 */
	public set url(url) {
		this._url = url;
	}

	/**
	 * Get the url to parse
	 * @returns {string}
	 * @example
	 * console.log(sitemapper.url)
	 */
	public get url() {
		return this._url;
	}
	private _url: string;
	private _timeout: number;
	/**
	 * Construct the Sitemapper class
	 *
	 * @params {Object} options to set
	 * @params {string} [options.url] - the Sitemap url (e.g http://wp.seantburke.com/sitemap.xml)
	 * @params {Timeout} [options.timeout] - the number of milliseconds before all requests timeout. The promises will still resolve so
	 * you'll still receive parts of the request, but maybe not all urls
	 * default is 15000 which is 15 seconds
	 *
	 * @example
	 * let sitemap = new Sitemapper({
	 * 		url: 'http://wp.seantburke.com/sitemap.xml',
	 *      timeout: 15000
	 * });
	 */
	constructor(options?: ISitemapperOptions) {
		const settings = options || {};
		this._url = settings.url;
		this._timeout = settings.timeout || 15000;
	}

	/**
	 * Gets the sites from a sitemap.xml with a given URL
	 *
	 * @public
	 * @param {string} url - the Sitemaps url (e.g http://wp.seantburke.com/sitemap.xml)
	 * @returns {Promise<ISitemapperResponse>}
	 * @example
	 * sitemapper.fetch('example.xml')
	 * 		.then((sites) => console.log(sites));
	 */
	public async fetch(url = this.url): Promise<ISitemapperResponse> {
		this._url = this._url || url;
		return {
			url,
			sites: await this.crawl(url)
		};
	}

	/**
	 * Resolve handler type for the promise in this.parse()
	 *
	 * @typedef {Object} ParseData
	 *
	 * @property {Error} error that either comes from `xmlParse` or `request` or custom error
	 * @property {Object} data
	 * @property {string} data.url - URL of sitemap
	 * @property {Array} data.urlset - Array of returned URLs
	 * @property {string} data.urlset.url - single Url
	 * @property {Object} data.sitemapindex - index of sitemap
	 * @property {string} data.sitemapindex.sitemap - Sitemap
	 * @example {
	 *        error: "There was an error!"
	 *        data: {
	 *          url: 'linkedin.com',
	 *          urlset: [{
	 *            url: 'www.linkedin.com/project1'
	 *          },[{
	 *            url: 'www.linkedin.com/project2'
	 *          }]
	 *        }
	 * }
	 */

	/**
	 * Requests the URL and uses xmlParse to parse through and find the data
	 *
	 * @private
	 * @param {string} [url] - the Sitemaps url (e.g http://wp.seantburke.com/sitemap.xml)
	 * @returns {Promise<ParseData>}
	 */
	public async parse(url = this.url): Promise<any> {
		const response = await request.get(url).set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8").timeout(this._timeout).buffer(true).parse(request.parse.image);
		return await this.parseXml(response.body);
	}

	/**
	 * Recursive function that will go through a sitemaps tree and get all the sites
	 *
	 * @private
	 * @recursive
	 * @param {string} url - the Sitemaps url (e.g http://wp.seantburke.com/sitemap.xml)
	 * @param {string} lastmod - internal optional - the lastmod to set on single sitemap
	 * @returns {Promise<string[]>} An array of urls
	 */
	public async crawlSite(url = this.url, lastmod?: string): Promise<ISiteMapperResult> {
		const data = await this.parse(url);
		if (data && data.urlset) {
			const urls = data.urlset;
			return {
				url,
				sitemaps: [
					{
						loc: url,
						lastmod,
						urls: urls.url.map((v: any) => {
							return {
								loc: (v.loc) ? v.loc[0] : null,
								lastmod: (v.lastmod) ? v.lastmod[0] : null,
								changefreq : (v.changefreq) ? v.changefreq[0] : null,
								priority: (v.priority) ? v.priority[0] : null
							};
						})
					}
				]
			};
		} else if (data && data.sitemapindex) {
			const sitemapindex = data.sitemapindex;

			const sitemaps = sitemapindex.sitemap;
			const promises: Array<Promise<ISiteMapperResult>> = sitemaps.map((site: any) => this.crawlSite(site.loc[0], site.lastmod));
			const results = await Promise.all(promises);

			return {
				url,
				sitemaps: results.map((v) => v.sitemaps).reduce((prev, curr) => prev.concat(curr), [])
			};

			// // Map each child url into a promise to create an array of promises
			// const sitemap = data.sitemapindex.sitemap.map((map) => map.loc && map.loc[0]);
			// const promiseArray = sitemap.map((site) => this.crawl(site));

			// // Make sure all the promises resolve then filter and reduce the array
			// const results = await Promise.all(promiseArray);
			// const sites = results.filter((result) => !(result as any).error)
			// 		.reduce((prev, curr) => (prev as any).concat(curr), []);
			// return sites;
		}
	}

	/**
	 * Recursive function that will go through a sitemaps tree and get all the sites
	 *
	 * @private
	 * @recursive
	 * @param {string} url - the Sitemaps url (e.g http://wp.seantburke.com/sitemap.xml)
	 * @returns {Promise<string[]>} An array of urls
	 */
	public async crawl(url = this.url): Promise<string[]> {
		return (await this.crawlSite(url)).sitemaps.map((v) => v.urls).reduce((prev, curr) => prev.concat(curr), []).map((v) => v.loc);
	}

	/**
	 * Callback for the getSites method
	 *
	 * @callback getSitesCallback
	 * @param {Object} error - error from callback
	 * @param {Array} sites - an Array of sitemaps
	 */

	/**
	 * Gets the sites from a sitemap.xml with a given URL
	 * @deprecated
	 * @param {string} url - url to query
	 * @param {getSitesCallback} callback - callback for sites and error
	 * @callback
	 */

	public getSites(url = this.url, callback: (err: Error, sites?: string[]) => void) {
		let err: Error = null;
		let sites: string[] = [];
		this.fetch(url).then((response) => {
			sites = response.sites;
			callback(err, sites);
		}).catch((error) => {
			err = error;
			callback(err);
		});
	}

	private async parseXml(xmlString: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			xmlParse.parseString(xmlString, (err, result) => {
				if (err) {
					return reject(err);
				}
				return resolve(result);
			});
		});

	}
}
