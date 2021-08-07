import load from './util/loadSounds.js';
import Soundtrack from './class/Soundtrack.js';
import ref from './references.js';
import lib from './lib.js';
import sandbox from '../game/sandbox/sandbox.js';
window.ref = ref;
lib();
window.onMenu = true;

window.addEventListener('load', () => {
   console.log('initial load time', Math.round(window.performance.now()), 'ms');
   // ref.overlay.classList.add('hidden');
   ref.startDiv.classList.remove('hidden');
   ref.startCanvas.width = 1600;
   ref.startCanvas.height = 900;
   const sCtx = ref.startCanvas.getContext('2d');
});

ref.guestButton.addEventListener('mousedown', () => {
   ref.startDiv.classList.add('start-animation');
   ref.startDiv.addEventListener('animationend', () => {
      ref.startDiv.classList.add('hidden');
   });
   for (const child of ref.startDiv.children) {
      child.style.opacity = '0';
   }
   ref.loadingScreen.classList.remove('hidden');
   window.menuSoundTrack = new Soundtrack(load('menu'));
   menuSoundTrack.onload = menuLoad;
});

ref.sandboxButton.addEventListener('mousedown', () => {
   ref.menuScreen.classList.add('fade-animation');
   ref.menuScreen.style.zIndex = '40000';
   ref.menuScreen.addEventListener('animationend', () => {
      ref.menuScreen.classList.remove('fade-animation');
      ref.menuScreen.classList.add('hidden');
   });
   ref.menuScreen.style.pointerEvents = 'none';
   // ref.loadingScreen.classList.remove('hidden');
   // ref.loadingScreen.classList.remove('start-animation');
   setTimeout(() => {
      // ref.loadingScreen.classList.add('fade-animation');
      // ref.loadingScreen.addEventListener('animationend', onAnimationEnd);
      // function onAnimationEnd() {
      //    ref.loadingScreen.classList.add('hidden');
      //    ref.loadingScreen.removeEventListener('animationend', onAnimationEnd);
      // }
      ref.gameScreen.classList.remove('hidden');
      ref.gameScreen.classList.add('fade-in-animation');
      sandbox();
   }, 2000);
});

function menuLoad() {
   console.log('loaded menu sounds');
   ref.loadingScreen.classList.add('fade-animation');
   function onAnimationEnd() {
      ref.loadingScreen.classList.add('hidden');
      menuSoundTrack.play();
      ref.loadingScreen.removeEventListener('animationend', onAnimationEnd);
   }
   ref.loadingScreen.addEventListener('animationend', onAnimationEnd);
   ref.menuScreen.classList.remove('hidden');
}

container.addEventListener('mousemove', (event) => {
   const bound = container.getBoundingClientRect();
   const mouseX = Math.round((event.pageX - bound.left) / window.scale);
   const mouseY = Math.round((event.pageY - bound.top) / window.scale);
   // ref.backgroundImage.style.left = `${73 + (mouseX - width / 2) / 4}px`;
   // ref.backgroundImage.style.top = `${41 + (mouseY - height / 2) / 4}px`;
});
