export default function lib() {
   window.faded = 0;
   window.currentFade = 0;
   window.fadeRate = 0.5;
   window.fade = function () {
      window.faded = 1;
   };

   window.random = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   };

   window.onMaxFade = function () {};

   window.resize = function (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
   };

   resize(ref.fadeCanvas);

   window.addEventListener('resize', () => {
      // resize all canvases
      resize(ref.fadeCanvas);
   });

   window.update = function (delta) {
      // fade canvas update
      if (window.faded > 0) {
         window.currentFade += fadeRate * delta;
      } else if (window.currentFade > window.faded) {
         window.currentFade -= fadeRate * delta;
      }
      window.currentFade = Math.max(window.currentFade, 0);

      if (window.currentFade > 1.5) {
         window.currentFade = 1;
         window.faded = 0;
         onMaxFade();
      }
   };

   window.renderFadeCanvas = function () {
      const ctx = ref.fadeCanvas.getContext('2d');
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = `rgba(0, 0, 0, ${currentFade})`;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
   };

   window.render = function () {
      renderFadeCanvas();
   };

   window.lastFrame = window.performance.now();
   (function run() {
      const delta = Math.min((window.performance.now() - lastFrame) / 1000, 1 / 10);
      update(delta);
      render();
      requestAnimationFrame(run);
   })();
}
