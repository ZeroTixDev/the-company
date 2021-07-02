const ref = {
   loadingScreen: '.loading',
   gameScreen: '.game',
   startDiv: '.start',
   fadeCanvas: '.fade-canvas',
};

for (const key of Object.keys(ref)) {
   const selector = `${ref[key]}`;
   ref[key] = document.querySelector(selector);
}

export default ref;
