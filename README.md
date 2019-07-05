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
Statements   : 93.18% ( 41/44 )
Branches     : 72.41% ( 21/29 )
Functions    : 95.45% ( 21/22 )
Lines        : 92.31% ( 36/39 )
================================================================================
```

### Documentation
```
npm run doc
```
