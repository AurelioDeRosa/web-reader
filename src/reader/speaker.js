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
 * @typedef SpeechSynthesisUtteranceHash
 * @type {Object}
 * @property {string} text The text to be synthesized and spoken
 * @property {string} [lang=''] The language of the speech synthesis for the utterance.
 * If unspecified it defaults to the language of the html document root element
 * @property {string} [voice=''] The voice to use
 * @property {number} [volume=1.0] The speaking volume
 * @property {number} [rate=1.0] The speaking rate
 * @property {number} [pitch=1.0] The speaking pitch
 *
 * @see https://dvcs.w3.org/hg/speech-api/raw-file/tip/webspeechapi.html#utterance-attributes
 */

/**
 * Retrieves the object that allows to speech the text or
 * <code>null</code> if the feature is not supported
 *
 * @returns {speechSynthesis|null}
 */
function getSpeaker() {
   return window.speechSynthesis ||
          null;
}

/**
 * Searches a voice among those provided
 *
 * @param {SpeechSynthesisUtterance[]} voices The voices available
 * @param {string} target The voice to search
 *
 * @return {SpeechSynthesisUtterance|undefined}
 */
function searchVoice(voices, target) {
   return voices
      .filter(voice => voice.voiceURI === target)
      .pop();
}

/**
 * Sets the settings for a <code>SpeechSynthesisUtterance</code> object
 *
 * @param {SpeechSynthesisUtterance} utterance The object whose settings will be set
 * @param {SpeechSynthesisUtteranceHash} settings
 * @param {SpeechSynthesisUtterance[]} voices The voices available
 */
function setUtteranceSettings(utterance, settings, voices) {
   for(let key in settings) {
      if (!settings.hasOwnProperty(key) || utterance[key] === undefined) {
         continue;
      }

      if (key !== 'voice') {
         utterance[key] = settings[key];
         continue;
      }

      let voice = searchVoice(voices, settings[key]);

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
 *
 * @class
 */
export
 default class Speaker {
   /**
    * Creates a Speaker instance
    *
    * @constructor
    *
    * @param {SpeechSynthesisUtteranceHash} [options={}] The options to customize the voice prompting the texts
    */
   constructor(options = {}) {
      /**
       *
       * @type {speechSynthesis|null}
       */
      this.speaker = getSpeaker();
      /**
       *
       * @type {SpeechSynthesisUtteranceHash}
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
               let eventData = Object.assign({
                  text
               }, this.settings);

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
            });
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