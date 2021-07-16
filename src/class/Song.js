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
   stop() {
      this.audio.pause();
      this.audio.currentTime = 0;
   }
   play() {
      this.audio.currentTime = 0;
      this.audio.play();
   }
}
