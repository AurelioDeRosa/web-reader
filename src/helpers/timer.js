/**
 * The class representing a timer
 *
 * @class
 */
export
   default class Timer {
   /**
    * Waits for the amount of milliseconds specified
    *
    * @param {number} milliseconds The amount of milliseconds to wait
    *
    * @return {Promise}
    */
   static wait(milliseconds) {
      return new Promise(resolve => window.setTimeout(resolve, milliseconds));
   }
}