import Speaker from '../../../src/reader/speaker';

/**
 * @test {Speaker}
 */
describe('Speaker', () => {
   const speaker = new Speaker();

   describe('constructor()', () => {
      it('should crate an instance of Speaker', () => {
         let speaker = new Speaker();

         assert.instanceOf(speaker, Speaker, 'The returned object is an instance of Speaker');
         assert.isObject(speaker.settings, 'The settings property is exposed');
      });

      it('should expose the provided settings', () => {
         const settings = {
            text: 'this is a test',
            lang: 'en-GB',
            voice: 'Google UK English Female',
            volume: 0.25,
            rate: 0.8,
            pitch: 0.9
         };
         let speaker = new Speaker(settings);

         assert.strictEqual(speaker.settings, settings, 'The settings provided are correctly exposed');
      });
   });

   describe('isSupported()', () => {
      it('should detect if the speak feature is available', () => {
         assert.strictEqual(Speaker.isSupported(), !!window.speechSynthesis, 'Feature detected correctly');
      });
   });

   describe('isSpeaking()', () => {
      beforeEach(() => {
         speaker.cancel();
      });

      it('should return true if a text is being prompted', done => {
         function synthesisStart() {
            document.removeEventListener('webreader.synthesisstart', synthesisStart);

            assert.isTrue(speaker.isSpeaking(), 'The speech is in progress');
         }

         function synthesisEnd() {
            document.removeEventListener('webreader.synthesisend', synthesisEnd);

            assert.isFalse(speaker.isSpeaking(), 'The speech is complete');

            done();
         }

         speaker.speak('hello');

         document.addEventListener('webreader.synthesisstart', synthesisStart);
         document.addEventListener('webreader.synthesisend', synthesisEnd);
      });

      it('should return false if a text is not being prompted', () => {
         assert.isFalse(speaker.isSpeaking(), 'The speaker is not speaking');
      });
   });

   describe('getVoices()', () => {
      it('should return all the voices available', () => {
         let promise = speaker.getVoices();

         return Promise.all([
            assert.instanceOf(promise, Promise, 'The value returned is a promise'),
            assert.isFulfilled(promise, 'The promise is fulfilled'),
            assert.eventually.instanceOf(promise, Array, 'The value returned by the promise is an instance of Array'),
            promise.then(voices => {
               let test = voices.every(voice => {
                  return Object.prototype.toString.call(voice) === '[object SpeechSynthesisVoice]';
               });

               assert.isTrue(test, 'The value returned by the promise contains SpeechSynthesisVoice instances only');
            })
         ]);
      });
   });

   describe('speak()', () => {
      context('with the default settings', () => {
         it('should prompt the text provided', () => {
            let text = 'hello';
            let spy = sinon.spy(window.speechSynthesis, 'speak');
            let promise = speaker.speak(text);

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  assert.isTrue(spy.calledOnce, 'The native speak method is called');
                  assert.propertyVal(spy.getCall(0).args[0], 'text', text, 'The prompted text is correct');

                  spy.restore();
               })
            ]);
         });
      });

      context('with custom settings', () => {
         it('should prompt the text provided', () => {
            return speaker
               .getVoices()
               .then(voices => {
                  let settings = {
                     text: 'test',
                     lang: 'en-GB',
                     voice: 'Google UK English Female',
                     volume: 0.25,
                     rate: 0.8,
                     pitch: 0.9
                  };
                  let voice = voices
                     .filter(voice => voice.voiceURI === settings.voice)
                     .pop();
                  let speaker = new Speaker(settings);
                  let spy = sinon.spy(window.speechSynthesis, 'speak');
                  let promise = speaker.speak(settings.text);

                  return Promise.all([
                     assert.instanceOf(promise, Promise, 'The value returned is a promise'),
                     assert.isFulfilled(promise, 'The promise is fulfilled'),
                     promise.then(() => {
                        let utterance = new window.SpeechSynthesisUtterance();
                        let utteranceArgument = spy.getCall(0).args[0];

                        Object
                           .keys(settings)
                           .forEach(property => {
                              utterance[property] = property === 'voice' ? voice : settings[property];
                           });

                        assert.isTrue(spy.calledOnce, 'The native speak method is called');

                        Object
                           .keys(settings)
                           .forEach(property => {
                              assert.strictEqual(
                                 utteranceArgument[property],
                                 property === 'voice' ? voice : utterance[property],
                                 'The argument passed to the native speak method is correct'
                              );
                           });

                        spy.restore();
                     })
                  ]);
               });
         });
      });
   });

   describe('cancel()', () => {
      it('should stop the speaker', () => {
         let spy = sinon.spy(window.speechSynthesis, 'cancel');

         speaker.cancel();

         assert.isTrue(spy.calledOnce, 'The native cancel method is called');

         spy.restore();
      });
   });
});