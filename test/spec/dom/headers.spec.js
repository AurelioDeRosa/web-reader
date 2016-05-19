import * as Headers from '../../../src/dom/headers';

describe('getHeaders()', function() {
   before(function() {
      fixture.setBase('test/fixtures/dom/headers');
   });

   beforeEach(function() {
      fixture.load('page.html');
   });

   afterEach(function() {
      fixture.cleanup();
   });

   context('with no parameters', function() {
      it('should return all the headers', function() {
         assert.sameDeepMembers(
            Headers.getHeaders(),
            Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')),
            'All the headers are returned'
         );
      });
   });

   context('with parameters', function() {
      it('should return the headers of the required level', function() {
         for(let level = 1; level <= 6; level++) {
            assert.sameDeepMembers(
               Headers.getHeaders({
                  level: level
               }),
               Array.from(document.querySelectorAll(`h${level}`)),
               `All the H${level} are returned`
            );
         }
      });

      it('should return the headers containing the required text', function() {
         assert.sameDeepMembers(
            Headers.getHeaders({
               text: 'title'
            }),
            Array.from(document.querySelectorAll('.text-filter')),
            'All headers containing the required word are returned'
         );
      });
   });
});

describe('createHeadingsStructure()', function() {
   before(function() {
      fixture.setBase('test/fixtures/dom/headers');
   });

   beforeEach(function() {
      fixture.load('page.html');
   });

   afterEach(function() {
      fixture.cleanup();
   });

   it('should create a tree representing the headings structure of the page', function() {
      let expectedTree = [
         {
            element: document.querySelector('.l1'),
            subheadings: [
               {
                  element: document.querySelector('.l1-1'),
                  subheadings: [
                     {
                        element: document.querySelector('.l1-1-1'),
                        subheadings: []
                     },
                     {
                        element: document.querySelector('.l1-1-2'),
                        subheadings: []
                     }
                  ]
               },
               {
                  element: document.querySelector('.l1-2'),
                  subheadings: []
               }
            ]
         }
      ];
      let tree = Headers.createHeadingsStructure(
         document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      );

      assert.deepEqual(tree, expectedTree, 'The correct tree structure is returned');
   });
});