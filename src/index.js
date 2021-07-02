import load from './util/loadSounds.js';
import Soundtrack from './class/Soundtrack.js';
import ref from './references.js';
import lib from './lib.js';
import menuEffect from './scripts/loadingEffect.js';
window.ref = ref;
lib();

window.addEventListener('load', () => {
   window.menuSoundTrack = new Soundtrack(load('menu'));
   menuSoundTrack.onload = menuLoad;
   menuEffect.Start();
});
function menuLoad() {
   console.log('loaded menu sounds');
   fade();
   onMaxFade = () => {
      ref.startDiv.classList.remove('hidden');
      ref.loadingScreen.classList.add('hidden');
      menuEffect.SetChaos(10);
      document.onkeydown = function (event) {
         if (event.repeat) return;
         if (event.type === 'keydown' && event.code === 'Space') {
            // transition into menu and start playing songs
            menuSoundTrack.play();
            menuEffect.SetChaos(0);
            ref.startDiv.classList.add('disappear');
            ref.startDiv.ontransitionend = function () {
               ref.startDiv.classList.add('hidden');
            };
            fade();
            onMaxFade = () => {
               menuEffect.Stop();
            };
            document.onkeydown = (event) => {};
         }
      };
   };
}
