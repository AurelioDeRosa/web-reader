/**
 * The class representing an event emitter
 *
 * @class
 */
export
   default class EventEmitter {
   /**
    * Returns the namespace of the events
    *
    * @return {string}
    */
   static get namespace() {
      return 'webreader';
   }

   /**
    * Namespaces an event
    *
    * @param {string} eventName The event name
    *
    * @return {string}
    */
   static namespaceEvent(eventName) {
      return `${EventEmitter.namespace}.${eventName}`;
   }

   /**
    * Fires an event
    *
    * @param {string} eventName The name of the event
    * @param {HTMLElement|Document} element The element on which the event is dispatched
    * @param {Object} [properties={}] A set of key-values to assign to the event
    */
   static fireEvent(eventName, element, properties = {}) {
      let customEvent = document.createEvent('Event');

      customEvent.initEvent(eventName, true, true);

      Object
         .getOwnPropertyNames(properties)
         .forEach(property => {
            customEvent[property] = properties[property];

            // Internet Explorer and some older versions of other browsers don't throw
            // a TypeError when trying to assign a value to a read-only property.
            // To keep the behavior consistent, I check that the value is actually
            // changed. If the value is not changed, the expected TypeError is thrown.
            if (customEvent[property] !== properties[property]) {
               throw new TypeError('Cannot set a property which has only a getter');
            }
         });

      element.dispatchEvent(customEvent);
   }
}