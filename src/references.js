const ref = {
   loadingScreen: '.loading',
   gameScreen: '.game',
   menuScreen: '.menu',
   overlay: '.overlay',
   startDiv: '.start',
   guestButton: '.guest',
   fadeCanvas: '.fade-canvas',
   startCanvas: '.start-canvas',
   sandboxButton: '.sandbox',
   // backgroundImage: '.background-image',
};

for (const key of Object.keys(ref)) {
   const selector = `${ref[key]}`;
   ref[key] = document.querySelector(selector);
}

export default ref;
