import EventEmitter from '../helpers/event-emitter';
import WebReaderError from '../webreader-error';

/**
 * This constant is needed because Chrome doesn't fire an error event
 * if the <code>cancel()</code> method is called.
 *
 * @type {Symbol}
 */
const isCancelledSymbol = Symbol('isCancelled');

/**
 * Retrieves the object that allows to prompt the text or
 * <code>null</code> if the feature is not supported
 *
 * @returns {speechSynthesis|null}
 */
function getSpeaker() {
   return speechSynthesis ||
          null;
}

function setUtteranceSettings(utterance, settings, voices) {
   for(let key in settings) {
      if (!settings.hasOwnProperty(key) || utterance[key] === undefined) {
         continue;
      }

      if (key !== 'voice') {
         utterance[key] = settings[key];
         continue;
      }

      let voice = voices
         .filter(voice => voice.voiceURI === settings[key])
         .pop();

      if (voice) {
         utterance[key] = voice;
      } else {
         console.debug('The voice selected is not available. Falling back to one available');
         utterance[key] = voices[0];
      }
   }
}

/**
 * The class exposing the speaking features of a web page
 * @class
 */
export default class Speaker {
   /**
    * Creates a Speaker instance
    *
    * @constructor
    *
    * @param {Object} [options={}] The options to customize the voice prompting the texts
    */
   constructor(options = {}) {
      /**
       *
       * @type {speechSynthesis|null}
       */
      this.speaker = getSpeaker();
      /**
       *
       * @type {Object}
       */
      this.settings = options;
      /**
       *
       * @type {boolean}
       */
      this[isCancelledSymbol] = false;

      if (!this.speaker) {
         throw Error('API not supported');
      }
   }

   /**
    * Detects if the speech feature is supported
    *
    * @returns {boolean}
    */
   static isSupported() {
      return !!getSpeaker();
   }

   /**
    * Returns the list of voices available
    *
    * @return {Promise}
    */
   getVoices() {
      return new Promise(resolve => {
         let voices = this.speaker.getVoices();

         if (voices.length > 1) {
            return resolve(voices);
         } else {
            let onVoicesChanged = function() {
               resolve(this.speaker.getVoices());

               getSpeaker().removeEventListener('voiceschanged', onVoicesChanged);
            }.bind(this);

            getSpeaker().addEventListener('voiceschanged', onVoicesChanged);
         }
      });
   }

   /**
    * Prompts a text
    *
    * @param {string} text The text to prompt
    *
    * @returns {Promise}
    */
   speak(text) {
      return this
         .getVoices()
         .then(voices => {
            return new Promise((resolve, reject) => {
               let utterance = new window.SpeechSynthesisUtterance(text);
               let eventData = Object.assign({text}, this.settings);

               setUtteranceSettings(utterance, this.settings, voices);

               utterance.addEventListener('start', () => {
                  console.debug(`Synthesizing the text: ${text}`);

                  EventEmitter.fireEvent(`${EventEmitter.namespace}.synthesisstart`, document, {
                     data: eventData
                  });
               });

               utterance.addEventListener('end', () => {
                  console.debug('Synthesis completed');

                  EventEmitter.fireEvent(`${EventEmitter.namespace}.synthesisend`, document, {
                     data: eventData
                  });

                  if (this[isCancelledSymbol]) {
                     this[isCancelledSymbol] = false;
                     return reject({
                        error: 'interrupted'
                     });
                  }

                  resolve();
               });

               utterance.addEventListener('error', event => {
                  console.debug('Synthesis error: ', event.error);

                  EventEmitter.fireEvent(`${EventEmitter.namespace}.synthesiserror`, document, {
                     data: eventData
                  });

                  reject(new WebReaderError('An error has occurred while speaking'));
               });

               this.speaker.speak(utterance);
            })
         });
   }

   /**
    * Stops the prompt of the utterance
    */
   cancel() {
      this.speaker.cancel();
      this[isCancelledSymbol] = true;
   }
}