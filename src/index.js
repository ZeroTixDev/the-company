import load from './util/loadSounds.js';
import Soundtrack from './class/Soundtrack.js';
import ref from './references.js';
import lib from './lib.js';
import sandbox from '../game/sandbox/sandbox.js';
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
   ref.guestButton.classList.add('button-focus');
   ref.loadingScreen.classList.remove('hidden');
   window.menuSoundTrack = new Soundtrack(load('menu'));
   menuSoundTrack.onload = menuLoad;
});

ref.sandboxButton.addEventListener('mousedown', () => {
   ref.menuScreen.classList.add('start-animation');
   ref.menuScreen.style.zIndex = '40000';
   ref.menuScreen.addEventListener('animationend', () => {
      ref.menuScreen.classList.add('hidden');
   });
   ref.sandboxButton.classList.add('button-focus');
   ref.loadingScreen.classList.remove('hidden');
   ref.loadingScreen.classList.remove('start-animation');
   setTimeout(() => {
      ref.loadingScreen.classList.add('start-animation');
      ref.loadingScreen.addEventListener('animationend', onAnimationEnd);
      function onAnimationEnd() {
         ref.loadingScreen.classList.add('hidden');
         ref.loadingScreen.removeEventListener('animationend', onAnimationEnd);
      }
      ref.gameScreen.classList.remove('hidden');
      sandbox();
   }, 1000);
});

function menuLoad() {
   console.log('loaded menu sounds');
   ref.loadingScreen.classList.add('start-animation');
   function onAnimationEnd() {
      ref.loadingScreen.classList.add('hidden');
      menuSoundTrack.play();
      ref.loadingScreen.removeEventListener('animationend', onAnimationEnd);
   }
   ref.loadingScreen.addEventListener('animationend', onAnimationEnd);
   ref.menuScreen.classList.remove('hidden');
}
