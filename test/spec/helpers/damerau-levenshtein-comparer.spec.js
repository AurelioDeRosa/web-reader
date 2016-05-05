import DamerauLevenshteinComparer from '../../../src/helpers/string-comparers/damerau-levenshtein-comparer';

/**
 * @test {DamerauLevenshteinComparer}
 */

describe('DamerauLevenshteinComparer', () => {
   describe('findCloserMatch()', () => {
      it('should return an object', () => {
         let match = DamerauLevenshteinComparer.findCloserMatch('hi', 'hello');

         assert.isObject(match, 'The returned value is an object');
         assert.property(match, 'index', 'The returned value possesses an "index" property');
         assert.property(match, 'distance', 'The returned value possesses a "distance" property');
      });

      it('should find the closer match when a string is provided', () => {
         let tests = [
            {
               string: '',
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 5
               }
            },
            {
               string: 'hi',
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 4
               }
            },
            {
               string: 'something',
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 8
               }
            },
            {
               string: 'hello',
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 0
               }
            }
         ];

         for(let i = 0; i < tests.length; i++) {
            let match = DamerauLevenshteinComparer.findCloserMatch(tests[i].string, tests[i].target);

            assert.deepEqual(match, tests[i].expected, 'The returned value is correct');
         }
      });
      it('should find the closer match when an array containing one string is provided', () => {
         let tests = [
            {
               string: [],
               target: 'hello',
               expected: {
                  index: -1,
                  distance: Number.POSITIVE_INFINITY
               }
            },
            {
               string: [''],
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 5
               }
            },
            {
               string: ['hi'],
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 4
               }
            },
            {
               string: ['something'],
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 8
               }
            },
            {
               string: ['hello'],
               target: 'hello',
               expected: {
                  index: 0,
                  distance: 0
               }
            }
         ];

         for(let i = 0; i < tests.length; i++) {
            let match = DamerauLevenshteinComparer.findCloserMatch(tests[i].string, tests[i].target);

            assert.deepEqual(match, tests[i].expected, 'The returned value is correct');
         }
      });
      it('should find the closer match when an array with multiple strings is provided', () => {
         let tests = [
            {
               string: ['goodbye', 'hello', 'hi'],
               target: 'hello',
               expected: {
                  index: 1,
                  distance: 0
               }
            },
            {
               string: ['goodbye', 'stello', 'hi'],
               target: 'hello',
               expected: {
                  index: 1,
                  distance: 2
               }
            },
            {
               string: [
                  'this',
                  'is',
                  'a',
                  'test'
],
               target: 'that',
               expected: {
                  index: 0,
                  distance: 2
               }
            },
            {
               string: ['something', 'else'],
               target: 'hello',
               expected: {
                  index: 1,
                  distance: 3
               }
            }
         ];

         for(let i = 0; i < tests.length; i++) {
            let match = DamerauLevenshteinComparer.findCloserMatch(tests[i].string, tests[i].target);

            assert.deepEqual(match, tests[i].expected, 'The returned value is correct');
         }
      });
   });
});