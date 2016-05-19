import Commands from '../../src/commands';
import DamerauLevenshteinComparer from '../../src/helpers/string-comparers/damerau-levenshtein-comparer';
import currentTranslation from '../../lang/en-GB.json';

describe('Commands', function() {
   describe('constructor()', function() {
      it('should crate an instance of Commands', function() {
         let commands = new Commands(DamerauLevenshteinComparer);

         assert.instanceOf(commands, Commands, 'The returned object is an instance of Commands');
         assert.strictEqual(commands.StringComparer, DamerauLevenshteinComparer, 'The StringComparer is exposed');
      });

      it('should throw an exception if a StringComparer is not provided', function() {
         assert.throws(() => {
            new Commands(); // jshint ignore:line
         }, TypeError, /is not an instance of StringComparer/, 'The exception is thrown');
      });

      it('should throw an exception if the parameter provided is not a StringComparer', function() {
         assert.throws(() => {
            new Commands({}); // jshint ignore:line
         }, TypeError, /is not an instance of StringComparer/, 'The exception is thrown');
      });
   });

   describe('recognizeCommand()', function() {
      const commands = new Commands(DamerauLevenshteinComparer);

      before(function() {
         fixture.setBase('test/fixtures');
      });

      beforeEach(function() {
         fixture.load('commands.html');
      });

      afterEach(function() {
         fixture.cleanup();
      });

      it('should recognize a text with a perfect match', function() {
         let recognizedText = 'read all links';
         let command = commands.recognizeCommand(recognizedText, currentTranslation);

         assert.deepEqual(command, {
            command: 'READ_ALL_LINKS'
         });
      });

      it('should recognize a text with additional info having a perfect match ' +
         '("read headers of level" case)', function() {
            let recognizedText = 'read h3';
            let command = commands.recognizeCommand(recognizedText, currentTranslation);

            assert.deepEqual(command, {
            command: 'READ_LEVEL_HEADERS',
            level: 3
         });
         });

      it('should recognize a text with additional info having not having a perfect match ' +
         '("read headers of level" case)', function() {
         let recognizedText = 'read h do';
         let command = commands.recognizeCommand(recognizedText, currentTranslation);

         assert.deepEqual(command, {
            command: 'READ_LEVEL_HEADERS',
            level: 2
         });
      });

      it('should recognize a text with additional info having a perfect match ' +
         '("read links in element" case)', function() {
         let element = document.querySelector('main');
         let recognizedText = 'read all links in main';
         let command = commands.recognizeCommand(recognizedText, currentTranslation);

         assert.deepEqual(command, {
            command: 'READ_LINKS_IN_ELEMENT',
            element: element
         });
      });

      it('should recognize a text with additional info not having a perfect match ' +
         '("read links in element" case)', function() {
            let element = document.querySelector('header');
            let recognizedText = 'read all links in leather';
            let command = commands.recognizeCommand(recognizedText, currentTranslation);

            assert.deepEqual(command, {
            command: 'READ_LINKS_IN_ELEMENT',
            element: element
         });
         });

      it('should recognize a text without a perfect match', function() {
         let recognizedText = 'can you read alt headers?';
         let command = commands.recognizeCommand(recognizedText, currentTranslation);

         assert.deepEqual(command, {
            command: 'READ_ALL_HEADERS'
         });
      });
   });
});
