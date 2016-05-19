import Recognizer from '../../../src/reader/recognizer';

/**
 * @test {Recognizer}
 */

describe('Recognizer', function() {
   let recognizer, NativeRecognizer;

   before(function() {
      recognizer = new Recognizer();
      NativeRecognizer = window.SpeechRecognition || window.webkitSpeechRecognition;
   });

   describe('isSupported', function() {
      it('should detect if the recognition feature is available', function() {
         assert.strictEqual(Recognizer.isSupported(), !!NativeRecognizer, 'Feature detected correctly');
      });
   });
});