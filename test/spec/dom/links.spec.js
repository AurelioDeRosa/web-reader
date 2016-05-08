import * as Links from '../../../src/dom/links';

describe('getLinks()', () => {
   before(() => {
      fixture.setBase('test/fixtures/dom/links');
   });

   beforeEach(() => {
      fixture.load('page.html');
   });

   afterEach(() => {
      fixture.cleanup();
   });

   it('should return all links considered visible by a screen reader', () => {
      let visibleLinks = Array.from(document.querySelectorAll('.target'));

      assert.deepEqual(Links.getLinks(), visibleLinks, 'The correct links are retrieved');
   });

   it('should return all links inside an element considered visible by a screen reader', () => {
      let visibleLinks = Array.from(document.querySelectorAll('footer .target'));

      assert.deepEqual(Links.getLinks({
         ancestor: document.querySelector('footer')
      }), visibleLinks, 'The correct links are retrieved');
   });
});