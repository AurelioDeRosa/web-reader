// @TODO Extends Error. At the moment, Babel doesn't support subclassing native types

/**
 * The class representing the errors thrown by WebReader
 *
 * @class
 */
export
 default class WebReaderError {
   /**
    * Creates an instance of WebReaderError
    *
    * @constructor
    *
    * @param {string} message The message of the error
    */
   constructor(message) {
      /**
       * The name of error
       *
       * @type {string} WebReaderError
       */
      this.name = this.constructor.name;
      /**
       * The message describing the error
       *
       * @type {string}
       */
      this.message = message;
   }
}