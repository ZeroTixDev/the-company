export default class Soundtrack {
   constructor(data = {}) {
      this.inherit(data);
      this.loadedEverything = false;
      if (this.songs === undefined) {
         throw new Error(`Tried to make a soundtrack but could not retrieved sounds, data object -> ${data}`);
      }
      this.startLoadingTime = window.performance.now();
      this.songs.forEach((song) => {
         function onLoad() {
            song.audio.removeEventListener('canplaythrough', onLoad);
            song.audio.volume = this.volume;
            let isEverythingLoadedNow = true;
            for (const otherSong of this.songs) {
               if (otherSong.name === song.name) continue;
               if (!otherSong.loaded) {
                  isEverythingLoadedNow = false;
               }
            }
            if (isEverythingLoadedNow && !this.loadedEverything) {
               this.loadedEverything = true;
               console.log(
                  this.for,
                  'loading time',
                  Math.round(window.performance.now() - this.startLoadingTime),
                  'ms'
               );
               setTimeout(() => {
                  this.onload();
               }, 1000);
               // to make sure that its really fully loaded lol.
            }
         }
         song.audio.addEventListener('canplaythrough', onLoad.bind(this));
      });
      this.lastSongIndex = null;
   }
   generateSongIndex() {
      return window.random(0, this.songs.length - 1);
   }
   stop() {
      if (this.lastSongIndex === null) return;
      this.songs[this.lastSongIndex].audio.currentTime = 0;
      this.songs[this.lastSongIndex].audio.pause();
   }
   play() {
      if (this.random) {
         const songIndex = this.lastSongIndex === null ? this.generateSongIndex() : this.getUniqueSongIndex();
         this.lastSongIndex = songIndex;
         this.songs[songIndex].play();
         this.songs[songIndex].audio.onended = function () {
            console.log(this.songs[songIndex].name + ' song has ended.');
            this.songs[songIndex].stop();
            this.play();
         }.bind(this);
         console.log('playing', this.songs[songIndex].name);
      }
   }
   getUniqueSongIndex() {
      if (this.songs.length === 1) {
         return 0;
      }
      let amount = 0;
      let currentSongIndex = this.generateSongIndex();
      while (currentSongIndex === this.lastSongIndex) {
         amount++;
         if (amount > 100) {
            throw new Error('Could not find unique song from soundtrack');
         }
         currentSongIndex = this.generateSongIndex();
      }
      return currentSongIndex;
   }
   onload() {}
   inherit(data = {}) {
      for (const key of Object.keys(data)) {
         this[key] = data[key];
      }
   }
}
