import Speaker from '../../../src/reader/speaker';

/**
 * @test {Speaker}
 */
describe('Speaker', () => {
   let speaker, nativeSpeaker;

   before(() => {
      speaker = new Speaker();
      nativeSpeaker = window.speechSynthesis;
   });

   describe('Constructor', () => {
      it('should expose the speaker', () => {
         assert.deepEqual(speaker.speaker, nativeSpeaker, 'Speaker is exposed');
      });
   });

   describe('isSupported', () => {
      it('should detect if the speak feature is available', () => {
         assert.strictEqual(Speaker.isSupported(), !!nativeSpeaker, 'Feature detected correctly');
      });
   });
});