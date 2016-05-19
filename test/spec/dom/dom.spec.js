import Dom from '../../../src/dom/dom';

describe('highlightElement()', function() {
   context('with an invalid argument', function() {
      it('should not modify the element', function() {
         let textNode = document.createTextNode('hello');
         let anotherNode = textNode.cloneNode(true);

         Dom.highlightElement(anotherNode);
         assert.isTrue(textNode.isEqualNode(anotherNode), 'The argument is not modified');
      });
   });

   context('with a valid argument', function() {
      it('should highlight the element', function() {
         let element = document.createElement('p');
         let anotherElement = element.cloneNode(true);

         Dom.highlightElement(anotherElement);

         assert.instanceOf(anotherElement, HTMLElement, 'The argument is an HTMLElement');
         assert.isFalse(element.isEqualNode(anotherElement), 'The argument is modified');
         assert.strictEqual(
            anotherElement.firstElementChild.nodeName,
            'MARK',
            'The content of the element has been wrapped with a mark element'
         );
      });
   });
});

describe('unhighlightElement()', function() {
   context('with an invalid argument', function() {
      it('should not modify the element', function() {
         let textNode = document.createTextNode('hello');
         let anotherNode = textNode.cloneNode(true);

         Dom.unhighlightElement(anotherNode);
         assert.isTrue(textNode.isEqualNode(anotherNode), 'The argument is not modified');
      });
   });

   context('with a valid argument', function() {
      it('should unhighlight the element', function() {
         let element = document.createElement('p');
         let anotherElement = element.cloneNode(true);

         Dom.highlightElement(anotherElement);
         Dom.unhighlightElement(anotherElement);

         assert.instanceOf(anotherElement, HTMLElement, 'The argument is an HTMLElement');
         assert.isTrue(element.isEqualNode(anotherElement), 'The element is unwrapped');
      });
   });
});