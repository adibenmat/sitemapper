## Sitemap-parser

Parse through a sitemaps xml to get all the urls for your crawler.

### NOTICE
This is a fork of sitemapper by Sean Thomas Burke, converted to typescript and extended to return the full sitemap.xml schema.

### Installation
```bash
npm install @drorgl/sitemapper --save
```

### Simple Example
```typescript
import Sitemapper from "@drorgl/sitemapper";

let sitemap = new Sitemapper();

const result = await sitemap.crawlSite(url);

```

### Custom Request Limits
```typescript
import Sitemapper from "@drorgl/sitemapper";

let sitemapper = new Sitemapper({
    requester: new SuperAgentRequester({
        timeout: 15000,
        maximum_parallelism: 5,
        parallelism_delay: 100,
        gracefulFailure: true
    })
});

const result = await sitemap.crawlSite(url);
```

### Test
```
npm run test
```

### Coverage
```
npm run coverage
=============================== Coverage summary ===============================
Statements   : 93.42% ( 71/76 )
Branches     : 76.92% ( 30/39 )
Functions    : 96.43% ( 27/28 )
Lines        : 92.96% ( 66/71 )
================================================================================
```

### Documentation
```
npm run doc
```
