export
   default class EventEmitter {
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
    * @param {Object} [properties] A set of key-values to assign to the event
    */
   static fireEvent(eventName, element, properties) {
      let customEvent = document.createEvent('Event');

      customEvent.initEvent(eventName, true, true);

      for (let property in properties) {
         if (properties.hasOwnProperty(property)) {
            try {
               customEvent[property] = properties[property];
            } catch (ex) {
               console.debug(`Properties ${property} cannot be copied`);
            }
         }
      }

      element.dispatchEvent(customEvent);
   }
}