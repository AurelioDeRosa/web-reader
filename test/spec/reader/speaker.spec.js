import Speaker from '../../../src/reader/speaker';

const isCI = window.__karma__.config.args.indexOf('ci') >= 0; // jscs:disable disallowDanglingUnderscores

/**
 * @test {Speaker}
 */
describe('Speaker', function() {
   const settings = {
      volume: 0
   };
   const speaker = new Speaker(settings);

   describe('constructor()', function() {
      it('should crate an instance of Speaker', function() {
         let speaker = new Speaker();

         assert.instanceOf(speaker, Speaker, 'The returned object is an instance of Speaker');
         assert.isObject(speaker.settings, 'The settings property is exposed');
      });

      it('should expose the provided settings', function() {
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

   describe('isSupported()', function() {
      it('should detect if the speak feature is available', function() {
         assert.strictEqual(Speaker.isSupported(), !!window.speechSynthesis, 'Feature detected correctly');
      });
   });

   describe('isSpeaking()', function() {
      before(function() {
         if (isCI) {
            this.skip();
         }
      });

      beforeEach(function() {
         speaker.cancel();
      });

      it('should return true if a text is being prompted', function() {
         function synthesisStart() {
            document.removeEventListener('webreader.synthesisstart', synthesisStart);

            assert.isTrue(speaker.isSpeaking(), 'The speech is in progress');
         }

         function synthesisEnd() {
            document.removeEventListener('webreader.synthesisend', synthesisEnd);

            assert.isFalse(speaker.isSpeaking(), 'The speech is complete');
         }

         document.addEventListener('webreader.synthesisstart', synthesisStart);
         document.addEventListener('webreader.synthesisend', synthesisEnd);

         return speaker.speak('hello');
      });

      it('should return false if a text is not being prompted', function() {
         assert.isFalse(speaker.isSpeaking(), 'The speaker is not speaking');
      });
   });

   describe('getVoices()', function() {
      it('should return all the voices available', function() {
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

   describe('speak()', function() {
      before(function() {
         if (isCI) {
            this.skip();
         }
      });

      context('with the default settings', function() {
         it('should prompt the text provided', function() {
            let text = 'hello';
            let spy = sinon.spy(window.speechSynthesis, 'speak');
            let promise = speaker.speak(text);

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  assert.isTrue(spy.calledOnce, 'The native speak method is called');
                  assert.propertyVal(spy.getCall(0).args[0], 'text', text, 'The prompted text is correct');

                  window.speechSynthesis.speak.restore();
               })
            ]);
         });
      });

      context('with custom settings', function() {
         it('should prompt the text provided', function() {
            return speaker
               .getVoices()
               .then(voices => {
                  let settings = {
                     text: 'test',
                     lang: 'en-GB',
                     voice: 'Google UK English Female',
                     volume: 0.25,
                     rate: 1.5,
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

                        window.speechSynthesis.speak.restore();
                     })
                  ]);
               });
         });
      });
   });

   describe('cancel()', function() {
      it('should stop the speaker', function() {
         let spy = sinon.spy(window.speechSynthesis, 'cancel');

         speaker.cancel();

         assert.isTrue(spy.calledOnce, 'The native cancel method is called');

         window.speechSynthesis.cancel.restore();
      });
   });

   describe('events', function() {
      before(function() {
         if (isCI) {
            this.skip();
         }
      });

      it('should trigger a webreader.synthesisstart event when a text starts being prompted', function() {
         let text, synthesisStartSpy, speakSpy;

         function synthesisStart(event) {
            document.removeEventListener('webreader.synthesisstart', synthesisStart);

            assert.isOk(true, 'The event is triggered is executed');
            assert.isTrue(
               speakSpy.calledBefore(synthesisStartSpy),
               'The event is fired after the speak method is called'
            );
            assert.instanceOf(event, Event, 'The event listener receives an event');
            assert.property(event, 'data', 'The event exposes a data property');
            assert.deepEqual(
               event.data,
               Object.assign(
                  {
                     text
                  },
                  settings
               ),
               'The data property of the event possesses the settings provided in the constructor and the spoken text'
            );

            speaker.speak.restore();
         }

         text = 'hello';
         synthesisStartSpy = sinon.spy(synthesisStart);
         speakSpy = sinon.spy(speaker, 'speak');

         document.addEventListener('webreader.synthesisstart', synthesisStart);

         return speaker.speak(text);
      });

      it('should trigger a webreader.synthesisend event when a text ends being prompted', function() {
         let text, synthesisStartSpy, synthesisEndSpy, speakSpy;

         function synthesisStart() {
            document.removeEventListener('webreader.synthesisstart', synthesisStartSpy);
         }

         function synthesisEnd(event) {
            document.removeEventListener('webreader.synthesisend', synthesisEndSpy);

            assert.isOk(true, 'The event is triggered is executed');
            assert.isTrue(
               speakSpy.calledBefore(synthesisEndSpy),
               'The event is fired after the speak method is called'
            );
            assert.isTrue(
               synthesisStartSpy.calledBefore(synthesisEndSpy),
               'The webreader.synthesisend event is fired after the webreader.synthesisstart event'
            );
            assert.isFalse(speaker.isSpeaking(), 'The event is fired after the text has been prompted');
            assert.instanceOf(event, Event, 'The event listener receives an event');
            assert.property(event, 'data', 'The event exposes a data property');
            assert.deepEqual(
               event.data,
               Object.assign(
                  {
                     text
                  },
                  settings
               ),
               'The data property of the event possesses the settings provided in the constructor and the spoken text'
            );

            speaker.speak.restore();
         }

         text = 'hello';
         synthesisStartSpy = sinon.spy(synthesisStart);
         synthesisEndSpy = sinon.spy(synthesisEnd);
         speakSpy = sinon.spy(speaker, 'speak');

         document.addEventListener('webreader.synthesisstart', synthesisStartSpy);
         document.addEventListener('webreader.synthesisend', synthesisEndSpy);

         return speaker.speak(text);
      });

      // TODO: Find a way to trigger an error event to complete this test
      it('should trigger a webreader.synthesiserror event when an error occurs while a text is prompted');
   });
});