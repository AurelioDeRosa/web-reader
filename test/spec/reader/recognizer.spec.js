'use strict';

import Recognizer from '../../../src/reader/recognizer';

/**
 * @test {Recognizer}
 */

describe('Recognizer', () => {
   let recognizer, nativeRecognizer;

   before(() => {
      recognizer = new Recognizer();
      nativeRecognizer =  window.SpeechRecognition || window.webkitSpeechRecognition;
   });

   describe('Constructor', () => {
      it('should expose the recognizer', () => {
         assert.deepEqual(recognizer.recognizer, new nativeRecognizer(), 'Recognizer is exposed');
      });
   });

   describe('isSupported', () => {
      it('should detect if the recognition feature is available', () => {
         assert.strictEqual(Recognizer.isSupported(), !!nativeRecognizer, 'Feature detected correctly');
      });
   });
});