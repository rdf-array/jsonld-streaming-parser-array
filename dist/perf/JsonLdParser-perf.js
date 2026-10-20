"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
// tslint:disable-next-line:no-var-requires
const jsonld = require('jsonld');
const fileName = path.resolve(process.cwd(), process.argv[2]);
const TIMER = 'Parsing file ' + fileName;
// tslint:disable:no-console
console.time(TIMER);
jsonld.promises.toRDF(JSON.parse((0, fs_1.readFileSync)(fileName, 'utf-8')), { base: 'http://example.org/' })
    .then((plainQuads) => {
    console.timeEnd(TIMER);
    console.log('* Quads parsed: ' + plainQuads.length);
    console.log('* Memory usage: ' + Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB');
})
    .catch((e) => {
    console.log(e.details); // TOD
    throw e;
});
//# sourceMappingURL=JsonLdParser-perf.js.map