describe('Basic requirements', function() {
   it('should support the basic requirements', function() {
      assert.isDefined(window, 'window');
      assert.isDefined(window.SpeechRecognition || window.webkitSpeechRecognition, 'Speech recognition');
      assert.isDefined(window.speechSynthesis, 'Speech synthesis');
      assert.isDefined(document, 'document');
      assert.isDefined(document.querySelector, 'document.querySelector()');
      assert.isDefined(document.querySelectorAll, 'document.querySelectorAll()');
   });
});
