const ref = {
   loadingScreen: '.loading',
   gameScreen: '.game',
   overlay: '.overlay',
   startDiv: '.start',
   guestButton: '.guest',
   fadeCanvas: '.fade-canvas',
};

for (const key of Object.keys(ref)) {
   const selector = `${ref[key]}`;
   ref[key] = document.querySelector(selector);
}

export default ref;
