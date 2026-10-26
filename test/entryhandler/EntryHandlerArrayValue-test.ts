import {DataFactory} from "rdf-data-factory";
import "jest-rdf";
import {EntryHandlerArrayValue} from "../../lib/entryhandler/EntryHandlerArrayValue";
import {Util} from "../../lib/Util";
import {ParsingContextMocked} from "../../mocks/ParsingContextMocked";
import { ParsingContext } from '../../lib/ParsingContext';

const DF = new DataFactory();

describe('EntryHandlerArrayValue', () => {
  let handler: EntryHandlerArrayValue;

  beforeEach(() => {
    handler = new EntryHandlerArrayValue();
  });

  describe('isPropertyHandler', () => {
    it('should return false', async () => {
      expect(handler.isPropertyHandler()).toBe(false);
    });
  });

  describe('should handle', () => {
    let parsingContext: any;
    let util: Util;

    beforeEach(() => {
      parsingContext = new ParsingContextMocked({ parser: <any>null });
      util = new Util({ parsingContext });
    });

    it('a valid key stack, and handle the list element', async () => {
      jest.spyOn(handler, <any> 'handleListElement');
      await handler.handle(parsingContext, util, 0, [ undefined, 'parentKey', '@list', 0 ], "someValue", 3);
      expect((<any> handler).handleListElement).toHaveBeenCalledTimes(1);
      // rdf-array: the element is buffered until the list closes, nothing is emitted yet
      expect(parsingContext.emittedQuads).toEqual([]);
      expect(parsingContext.listPointerStack[3]).toEqual({ elements: [ DF.literal('someValue') ], listRootDepth: 1 });
    });

    it('an invalid key stack with an object parent key, and not handle the list element', async () => {
      jest.spyOn(handler, <any> 'handleListElement');
      await handler.handle(parsingContext, util, 0, [ undefined, {}, '@list', 0 ], "someValue", 3);
      expect((<any> handler).handleListElement).not.toHaveBeenCalled();
    });

    it('an invalid key stack without parent key, and not handle the list element', async () => {
      jest.spyOn(handler, <any> 'handleListElement');
      await handler.handle(parsingContext, util, 0, [ undefined, '@list', 0 ], "someValue", 2);
      expect((<any> handler).handleListElement).not.toHaveBeenCalled();
    });
  });
});
