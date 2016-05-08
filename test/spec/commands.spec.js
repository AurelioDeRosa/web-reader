import Commands from '../../src/commands';
import DamerauLevenshteinComparer from '../../src/helpers/string-comparers/damerau-levenshtein-comparer';
import currentTranslation from '../../lang/en-GB.json';

describe('Commands', () => {
   describe('constructor()', () => {
      it('should crate an instance of Commands', () => {
         let commands = new Commands(DamerauLevenshteinComparer);

         assert.instanceOf(commands, Commands, 'The returned object is an instance of Commands');
         assert.strictEqual(commands.StringComparer, DamerauLevenshteinComparer, 'The StringComparer is exposed');
      });

      it('should throw an exception if a StringComparer is not provided', () => {
         assert.throws(() => {
            new Commands(); // jshint ignore:line
         }, TypeError, /is not an instance of StringComparer/, 'The exception is thrown');
      });

      it('should throw an exception if the parameter provided is not a StringComparer', () => {
         assert.throws(() => {
            new Commands({}); // jshint ignore:line
         }, TypeError, /is not an instance of StringComparer/, 'The exception is thrown');
      });
   });

   describe('recognizeCommand()', () => {
      const commands = new Commands(DamerauLevenshteinComparer);

      before(() => {
         fixture.setBase('test/fixtures');
      });

      beforeEach(() => {
         fixture.load('commands.html');
      });

      afterEach(() => {
         fixture.cleanup();
      });

      it('should recognize a text with a perfect match', () => {
         let recognizedText = 'read all links';
         let command = commands.recognizeCommand(recognizedText, currentTranslation);

         assert.deepEqual(command, {
            command: 'READ_ALL_LINKS'
         });
      });

      it('should recognize a text with additional info having a perfect match ' +
         '("read headers of level" case)', () => {
            let recognizedText = 'read h3';
            let command = commands.recognizeCommand(recognizedText, currentTranslation);

            assert.deepEqual(command, {
            command: 'READ_LEVEL_HEADERS',
            level: 3
         });
         });

      it('should recognize a text with additional info having not having a perfect match ' +
         '("read headers of level" case)', () => {
            let recognizedText = 'read h do';
            let command = commands.recognizeCommand(recognizedText, currentTranslation);

            assert.deepEqual(command, {
            command: 'READ_LEVEL_HEADERS',
            level: 2
         });
         });

      it('should recognize a text with additional info having a perfect match ("read links in element" case)', () => {
         let element = document.querySelector('main');
         let recognizedText = 'read all links in main';
         let command = commands.recognizeCommand(recognizedText, currentTranslation);

         assert.deepEqual(command, {
            command: 'READ_LINKS_IN_ELEMENT',
            element: element
         });
      });

      it('should recognize a text with additional info not having a perfect match ' +
         '("read links in element" case)', () => {
            let element = document.querySelector('header');
            let recognizedText = 'read all links in leather';
            let command = commands.recognizeCommand(recognizedText, currentTranslation);

            assert.deepEqual(command, {
            command: 'READ_LINKS_IN_ELEMENT',
            element: element
         });
         });

      it('should recognize a text without a perfect match', () => {
         let recognizedText = 'can you read alt headers?';
         let command = commands.recognizeCommand(recognizedText, currentTranslation);

         assert.deepEqual(command, {
            command: 'READ_ALL_HEADERS'
         });
      });
   });
});
