import Timer from '../../../src/helpers/timer';

/**
 * @test {Timer}
 */

describe('Timer', function() {
   describe('wait()', function() {
      it('should wait for the amount of time specified', function() {
         let start = Date.now();
         let timer = Timer.wait(100);

         return timer.then(() => {
            assert.approximately(Date.now() - start, 100, 10, 'The waiting lasts as expected');
         });
      });
   });
});
