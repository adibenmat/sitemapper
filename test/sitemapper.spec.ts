import { expect } from "chai";
import isUrl from "is-url";
import "mocha";
import moment from "moment";

import { SuperAgentRequester } from "../src/crawler/SuperAgentRequester";
import Sitemapper from "../src/sitemapper";

describe("Sitemapper", () => {
	let sitemapper: Sitemapper;
	beforeEach(() => {
		sitemapper = new Sitemapper();
	});

	describe("Sitemapper Class", () => {

		it("should have crawl method", () => {
			expect(sitemapper.crawl).is.an.instanceof(Function);
		});

		it("should have parse method", () => {
			expect(sitemapper.parse).is.an.instanceOf(Function);
		});

		it("should have fetch method", () => {
			expect(sitemapper.fetch).is.an.instanceOf(Function);
		});

		it("should construct with a url", () => {
			sitemapper = new Sitemapper({
				url: "google.com",
			});
			expect(sitemapper.url).is.eq("google.com");
		});

		it("should construct with a timeout", () => {
			sitemapper = new Sitemapper({
				timeout: 1000,
			});
			expect(sitemapper.timeout).is.eq(1000);
		});

		it("should set timeout", () => {
			sitemapper.timeout = 1000;
			expect(sitemapper.timeout).is.eq(1000);
		});

		it("should set timeout", () => {
			sitemapper.url = "testvalue";
			expect(sitemapper.url).to.eq("testvalue");
		});

	});

	describe("fetch Method resolves sites to array", () => {
		it("http://wp.seantburke.com/sitemap.xml sitemaps should be an array", async () => {
			const url: string = "http://wp.seantburke.com/sitemap.xml";
			const data = await sitemapper.fetch(url);
			expect(data.sites).to.be.a("array");
			expect(data.url).to.eq(url);
			expect(data.sites.length).to.be.gt(2);
			expect(isUrl(data.sites[0])).to.eq(true);
		}).timeout(30000);

		it("giberish.giberish should fail silently with an empty array", async () => {
			const url: string = "http://giberish.giberish";
			try {
				await sitemapper.fetch(url);
			} catch (err) {
				expect(() => { throw err; }).to.throw(/notfound/i);
			}
		}).timeout(30000);

		it("https://www.searchenginejournal.com/sitemap_index.xml sitemaps should be an array", async () => {
			const url: string = "https://www.searchenginejournal.com/sitemap_index.xml";
			const data = await sitemapper.fetch(url);
			console.log("found", data.sites.length, "sites");
			expect(data.sites).to.be.instanceOf(Array);
			expect(data.url).to.eq(url);
			expect(data.sites.length).to.be.above(2);
			expect(isUrl(data.sites[0])).to.eq(true);
		}).timeout(30000);

		it("https://www.cnn.com/sitemaps/cnn/index.xml sitemaps should be an array", async () => {
			sitemapper = new Sitemapper({
				requester: new SuperAgentRequester(5000, 20, 100, true)
			});

			const url: string = "https://www.cnn.com/sitemaps/cnn/index.xml";
			const data = await sitemapper.fetch(url);
			console.log("found", data.sites.length, "sites");
			expect(data.sites).to.be.instanceOf(Array);
			expect(data.url).to.eq(url);
			expect(data.sites.length).to.be.greaterThan(2);
			expect(isUrl(data.sites[0])).to.eq(true);
		}).timeout(60000);
	});

	describe("getSites method", () => {
		it("getSites should be backwards compatible", (done) => {
			const url: string = "http://wp.seantburke.com/sitemap.xml";
			sitemapper.getSites(url, (err, sites) => {
				expect(sites).to.be.instanceOf(Array);
				expect(isUrl(sites[0])).to.eq(true);
				done();
			});

		}).timeout(30000);
	});

	describe("full methods", () => {
		it("parse urlset website - https://www.sitemaps.org/sitemap.xml", async () => {
			const url = "https://www.sitemaps.org/sitemap.xml";
			const urlSet = await sitemapper.crawlSite(url);
			const numberOfUrls = urlSet.sitemaps.reduce((prev, curr) => { prev.no += curr.urls.length; return prev; }, { no: 0 });
			console.log("total sitemaps:", urlSet.sitemaps.length, "total urls:", numberOfUrls.no);

			expect(urlSet.url).to.eq(url);
			expect(urlSet.sitemaps[0].loc).to.eq(url);
			expect(urlSet.sitemaps[0].lastmod).to.eq(undefined);

			expect(urlSet.sitemaps[0].urls.length).to.be.greaterThan(10);
			expect(isUrl(urlSet.sitemaps[0].urls[0].loc)).to.eq(true);
			expect(moment(urlSet.sitemaps[0].urls[0].lastmod).isValid()).to.eq(true);
		}).timeout(30000);

		it("parse sitemapindex https://www.searchenginejournal.com/sitemap_index.xml", async () => {
			const url = "https://www.searchenginejournal.com/sitemap_index.xml";
			const urlSet = await sitemapper.crawlSite(url);

			const numberOfUrls = urlSet.sitemaps.reduce((prev, curr) => { prev.no += curr.urls.length; return prev; }, { no: 0 });
			console.log("total sitemaps:", urlSet.sitemaps.length, "total urls:", numberOfUrls.no);

			expect(urlSet.url).to.eq(url);
			expect(moment(urlSet.sitemaps[0].lastmod).isValid()).to.eq(true);

			expect(urlSet.sitemaps[0].urls.length).to.be.greaterThan(10);
			expect(isUrl(urlSet.sitemaps[0].urls[0].loc)).to.eq(true);
			expect(moment(urlSet.sitemaps[0].urls[0].lastmod).isValid()).to.eq(true);
		}).timeout(30000);
	});
});
