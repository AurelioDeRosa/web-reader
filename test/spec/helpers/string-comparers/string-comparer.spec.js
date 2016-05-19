import StringComparer from '../../../../src/helpers/string-comparers/string-comparer';

/**
 * @test {StringComparer}
 */

describe('StringComparer', function() {
   describe('findCloserMatch()', function() {
      it('should throw an Error', function() {
         assert.throws(() => StringComparer.findCloserMatch('hi', 'hello'), Error);
      });
   });
});
