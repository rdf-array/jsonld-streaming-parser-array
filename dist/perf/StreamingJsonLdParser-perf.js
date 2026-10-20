"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const fs_1 = require("fs");
const path = require("path");
const fileName = path.resolve(process.cwd(), process.argv[2]);
const TIMER = 'Parsing file ' + fileName;
// tslint:disable:no-console
console.time(TIMER);
let count = 0;
const parsed = (0, fs_1.createReadStream)(fileName).pipe(new index_1.JsonLdParser({ baseIRI: 'http://example.org/' }));
parsed.on('data', (quad) => {
    count++;
});
parsed.on('error', (e) => {
    throw e;
});
parsed.on('end', () => {
    console.timeEnd(TIMER);
    console.log('* Quads parsed: ' + count);
    console.log('* Memory usage: ' + Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB');
});
//# sourceMappingURL=StreamingJsonLdParser-perf.js.map