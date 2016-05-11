import * as Main from '../../../src/dom/main';

describe('getMain()', () => {
   before(function() {
      fixture.setBase('test/fixtures/dom/main');
   });

   afterEach(function() {
      fixture.cleanup();
   });

   describe('single main element', () => {
      before(function() {
         fixture.load('single-main-element.html');
      });

      it('should return the main element', () => {
         assert.strictEqual(Main.getMain(), document.querySelector('main'));
      });
   });

   describe('multiple main elements', () => {
      before(function() {
         fixture.load('multiple-main-elements.html');
      });

      it('should return null', () => {
         assert.strictEqual(Main.getMain(), null);
      });
   });

   describe('single possible main', () => {
      before(function() {
         fixture.load('single-possible-main.html');
      });

      it('should return the possible main', () => {
         assert.strictEqual(Main.getMain(), document.querySelector('.main'));
      });
   });

   describe('multiple possible main', () => {
      before(function() {
         fixture.load('multiple-possible-main.html');
      });

      it('should return null', () => {
         assert.strictEqual(Main.getMain(), null);
      });
   });

   describe('no main', () => {
      before(function() {
         fixture.load('no-main.html');
      });

      it('should return null', () => {
         assert.strictEqual(Main.getMain(), null);
      });
   });
});