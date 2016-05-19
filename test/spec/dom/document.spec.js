import * as Document from '../../../src/dom/document';

describe('getTitle()', function() {
   it('should return the title of the document', function() {
      let newTitle = 'A new title';

      assert.strictEqual(Document.getTitle(), '', 'The initial title is returned');

      document.title = newTitle;

      assert.strictEqual(Document.getTitle(), newTitle, 'The updated title is returned');
   });
});