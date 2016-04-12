// @TODO Extends Error. At the moment, Babel doesn't support subclassing native types
export
 default class WebReaderError {
   constructor(message) {
      this.name = this.constructor.name;
      this.message = message;
   }
}