import StringComparer from '../../../../src/helpers/string-comparers/string-comparer';

/**
 * @test {StringComparer}
 */

describe('StringComparer', () => {
   describe('findCloserMatch()', () => {
      it('should throw an Error', () => {
         assert.throws(() => StringComparer.findCloserMatch('hi', 'hello'), Error);
      });
   });
});
