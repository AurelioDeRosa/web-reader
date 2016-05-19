import EventEmitter from '../../../src/helpers/event-emitter';

/**
 * @test {EventEmitter}
 */

describe('EventEmitter', function() {
   const namespace = 'webreader';
   let target;

   before(function() {
      fixture.setBase('test/fixtures/helpers');
   });

   beforeEach(function() {
      fixture.load('event-emitter.html');

      target = document.querySelector('.target');
   });

   afterEach(function() {
      fixture.cleanup();
   });

   describe('namespace', function() {
      it('should return the namespace', function() {
         assert.strictEqual(EventEmitter.namespace, namespace);
      });
   });

   describe('namespaceEvent', function() {
      it('should namespace an event', function() {
         assert.strictEqual(EventEmitter.namespaceEvent('click'), `${namespace}.click`, 'DOM event');
         assert.strictEqual(EventEmitter.namespaceEvent('synthesisend'), `${namespace}.synthesisend`, 'Custom event');
      });
   });

   describe('fireEvent', function() {
      it('should emit a DOM event', function(done) {
         let eventName = EventEmitter.namespaceEvent('focus');

         target.addEventListener(eventName, event => {
            assert.instanceOf(event, Event, 'The parameter passed is an instance of Event');
            assert.propertyVal(event, 'target', target, 'The target property is set to the correct element');
            assert.propertyVal(event, 'type', eventName, 'The event type is correct');

            done();
         });

         EventEmitter.fireEvent(eventName, target);
      });

      it('should emit a custom event', function(done) {
         let eventName = EventEmitter.namespaceEvent('synthesisend');

         target.addEventListener(eventName, event => {
            assert.instanceOf(event, Event, 'The parameter passed is an instance of Event');
            assert.propertyVal(event, 'target', target, 'The target property is set to the correct element');
            assert.propertyVal(event, 'type', eventName, 'The event type is correct');

            done();
         });

         EventEmitter.fireEvent(eventName, target);
      });

      it('should emit an event with custom options', function(done) {
         let eventName = 'keydown';
         let config = {
            which: 32,
            key: 32
         };

         target.addEventListener(eventName, event => {
            assert.instanceOf(event, Event, 'The parameter passed is an instance of Event');
            assert.propertyVal(event, 'target', target, 'The target property is set to the correct element');
            assert.propertyVal(event, 'type', eventName, 'The event type is correct');
            assert.propertyVal(event, 'which', 32, 'The event receive custom properties');
            assert.propertyVal(event, 'key', 32, 'The event receive custom properties');

            done();
         });

         EventEmitter.fireEvent(eventName, target, config);
      });

      it('should throw an error when emitting an event with custom options, including read-only ones', function() {
         let eventName = 'keydown';
         let config = {
            target: document,
            which: 32,
            key: 32
         };

         assert.throws(() => EventEmitter.fireEvent(eventName, target, config), TypeError);
      });
   });
});
