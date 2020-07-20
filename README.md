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

### Test
```
npm run test
```

### Coverage
```
npm run coverage
=============================== Coverage summary ===============================
Statements   : 93.33% ( 70/75 )
Branches     : 76.92% ( 30/39 )
Functions    : 96.43% ( 27/28 )
Lines        : 92.86% ( 65/70 )
================================================================================
```

### Documentation
```
npm run doc
```
