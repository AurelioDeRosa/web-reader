import Recognizer from '../../../src/reader/recognizer';

/**
 * @test {Recognizer}
 */

describe('Recognizer', () => {
   let recognizer, NativeRecognizer;

   before(() => {
      recognizer = new Recognizer();
      NativeRecognizer = window.SpeechRecognition || window.webkitSpeechRecognition;
   });

   describe('isSupported', () => {
      it('should detect if the recognition feature is available', () => {
         assert.strictEqual(Recognizer.isSupported(), !!NativeRecognizer, 'Feature detected correctly');
      });
   });
});