export default function lib() {
   window.width = 1600;
   window.height = 900;
   window.resize = function (div) {
      const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
      div.style.transform = `scale(${scale})`;
      div.style.width = `${width}px`;
      div.style.height = `${height}px`;
      div.style.left = `${(window.innerWidth - width) / 2}px`;
      div.style.top = `${(window.innerHeight - height) / 2}px`;
      return scale;
   };

   window.container = document.querySelector('.container');

   window.scale = resize(container);

   window.addEventListener('resize', () => {
      window.scale = resize(container);
   });

   window.random = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   };
}
