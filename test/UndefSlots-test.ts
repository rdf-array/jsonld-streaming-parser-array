import { DataFactory } from 'rdf-data-factory';
import { JsonLdParser } from '../index';
import { ParsingContext } from '../lib/ParsingContext';
import { Util } from '../lib/Util';

// rdf-undef: the undefSlots option, under which a null in a list is the empty slot of the sequence
const DF = new DataFactory();
const E = 'http://ex.org/';
const S = DF.namedNode(`${E}s`);
const P = DF.namedNode(`${E}p`);
const CONTAINER = { '@context': { p: { '@id': `${E}p`, '@container': '@list' }}, '@id': `${E}s` };

function parse(doc: any, undefSlots?: boolean): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const parser = new JsonLdParser({ dataFactory: DF, undefSlots });
    const quads: any[] = [];
    parser.on('data', quad => quads.push(quad));
    parser.on('error', reject);
    parser.on('end', () => resolve(quads));
    parser.write(JSON.stringify(doc));
    parser.end();
  });
}

function one(...values: any[]) {
  return { '@id': `${E}s`, [`${E}p`]: { '@list': values }};
}

function objects(quads: any[]): any[] {
  return quads.map(quad => quad.object);
}

describe('JsonLdParser with undefSlots', () => {
  const lit = (value: number) => DF.literal(`${value}`, DF.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
  const undef = DF.undef();

  it('reads a null in a @list as a slot', async () => {
    const quads = await parse(one(1, null, 3), true);
    expect(quads).toHaveLength(1);
    expect(quads[0].subject.equals(S)).toBeTruthy();
    expect(quads[0].predicate.equals(P)).toBeTruthy();
    expect(quads[0].object.equals(DF.sequence([ lit(1), undef, lit(3) ]))).toBeTruthy();
  });

  it('keeps a list of nothing but slots', async () => {
    expect(objects(await parse(one(null), true))[0].equals(DF.sequence([ undef ]))).toBeTruthy();
    expect(objects(await parse(one(null, null), true))[0].equals(DF.sequence([ undef, undef ]))).toBeTruthy();
  });

  it('reads a null at any depth', async () => {
    const quads = await parse(one({ '@list': [ null, 1 ]}, null), true);
    expect(objects(quads)[0].equals(DF.sequence([ DF.sequence([ undef, lit(1) ]), undef ]))).toBeTruthy();
  });

  it('reads a null in the array of a @container @list term', async () => {
    const quads = await parse({ ...CONTAINER, p: [ 1, null ]}, true);
    expect(objects(quads)[0].equals(DF.sequence([ lit(1), undef ]))).toBeTruthy();
  });

  it('reads a null in a nested array of a @container @list term', async () => {
    const quads = await parse({ ...CONTAINER, p: [[ null, 1 ], null ]}, true);
    expect(objects(quads)[0].equals(DF.sequence([ DF.sequence([ undef, lit(1) ]), undef ]))).toBeTruthy();
  });

  it('still drops a null that is not a member of a list', async () => {
    expect(objects(await parse({ '@id': `${E}s`, [`${E}p`]: [ 1, null ]}, true))[0].equals(lit(1))).toBeTruthy();
    expect(await parse({ '@id': `${E}s`, [`${E}p`]: null }, true)).toHaveLength(0);
    expect(await parse({ '@id': `${E}s`, [`${E}p`]: { '@list': null }}, true)).toHaveLength(0);
    expect(await parse({ ...CONTAINER, p: null }, true)).toHaveLength(0);
  });

  it('does not take a null value object for a slot', async () => {
    expect(objects(await parse(one({ '@value': null }), true))[0].equals(DF.sequence([]))).toBeTruthy();
  });

  it('drops a null in a list without the option, as JSON-LD 1.1 says', async () => {
    expect(objects(await parse(one(1, null, 3)))[0].equals(DF.sequence([ lit(1), lit(3) ]))).toBeTruthy();
    expect(objects(await parse(one(null), false))[0].equals(DF.sequence([]))).toBeTruthy();
  });

  it('needs a data factory with undef()', () => {
    const dataFactory: any = new DataFactory();
    dataFactory.undef = undefined;
    const util = new Util({ dataFactory, parsingContext: <ParsingContext> <any> {}});
    expect(() => util.undef()).toThrow('The data factory has no undef()');
  });
});
