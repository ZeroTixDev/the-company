export default class Song {
   constructor(name) {
      this.name = name;
      this.audio = new Audio();
      this.audio.src = `../../soundtrack/${name}.mp3`;
      this.loaded = false;
      this.audio.addEventListener('canplaythrough', () => {
         this.loaded = true;
      });
   }
   play() {
      this.audio.play();
   }
}
