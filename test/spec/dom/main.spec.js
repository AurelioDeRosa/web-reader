import * as Main from '../../../src/dom/main';

describe('getMain()', function() {
   before(function() {
      fixture.setBase('test/fixtures/dom/main');
   });

   afterEach(function() {
      fixture.cleanup();
   });

   describe('single main element', function() {
      before(function() {
         fixture.load('single-main-element.html');
      });

      it('should return the main element', function() {
         assert.strictEqual(Main.getMain(), document.querySelector('main'));
      });
   });

   describe('multiple main elements', function() {
      before(function() {
         fixture.load('multiple-main-elements.html');
      });

      it('should return null', function() {
         assert.strictEqual(Main.getMain(), null);
      });
   });

   describe('single possible main', function() {
      before(function() {
         fixture.load('single-possible-main.html');
      });

      it('should return the possible main', function() {
         assert.strictEqual(Main.getMain(), document.querySelector('.main'));
      });
   });

   describe('multiple possible main', function() {
      before(function() {
         fixture.load('multiple-possible-main.html');
      });

      it('should return null', function() {
         assert.strictEqual(Main.getMain(), null);
      });
   });

   describe('no main', function() {
      before(function() {
         fixture.load('no-main.html');
      });

      it('should return null', function() {
         assert.strictEqual(Main.getMain(), null);
      });
   });
});