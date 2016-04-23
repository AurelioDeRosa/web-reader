import Commands from '../../src/commands';
import DamerauLevenshteinComparer from '../../src/helpers/string-comparers/damerau-levenshtein-comparer';
import currentTranslation from '../../lang/en-GB.json';

describe('recognizeCommand()', () => {
   let commands;

   before(() => {
      commands = new Commands(DamerauLevenshteinComparer);
   });

   it('should recognize a text with a perfect match', () => {
      let recognizedText = 'read all links';
      let command = commands.recognizeCommand(recognizedText, currentTranslation);

      assert.deepEqual(command, {
         command: 'READ_ALL_LINKS'
      });
   });

   it('should recognize a text with additional info', () => {
      let recognizedText = 'read h1';
      let command = commands.recognizeCommand(recognizedText, currentTranslation);

      assert.deepEqual(command, {
         command: 'READ_LEVEL_HEADERS',
         level: 1
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
