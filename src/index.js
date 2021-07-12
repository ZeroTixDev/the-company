import load from './util/loadSounds.js';
import Soundtrack from './class/Soundtrack.js';
import ref from './references.js';
import lib from './lib.js';
window.ref = ref;
lib();

window.addEventListener('load', () => {
   console.log('initial load time', Math.round(window.performance.now()), 'ms');
   ref.overlay.classList.add('hidden');
   ref.startDiv.classList.remove('hidden');
});

ref.guestButton.addEventListener('mousedown', () => {
   ref.startDiv.classList.add('start-animation');
   ref.startDiv.addEventListener('animationend', () => {
      ref.startDiv.classList.add('hidden');
   });
   ref.loadingScreen.classList.remove('hidden');
   window.menuSoundTrack = new Soundtrack(load('menu'));
   menuSoundTrack.onload = menuLoad;
});

function menuLoad() {
   console.log('loaded menu sounds');
   ref.loadingScreen.classList.add('start-animation');
   ref.loadingScreen.addEventListener('animationend', () => {
      ref.loadingScreen.classList.add('hidden');
   });
   ref.gameScreen.classList.remove('hidden');
}
