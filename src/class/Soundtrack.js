export default class Soundtrack {
   constructor(data = {}) {
      this.inherit(data);
      if (this.songs === undefined) {
         throw new Error(`Tried to make a soundtrack but could not retrieved sounds, data object -> ${data}`);
      }
      this.songs.forEach((song) => {
         function onLoad() {
            song.audio.removeEventListener('canplaythrough', onLoad);
            let isEverythingLoadedNow = true;
            for (const otherSong of this.songs) {
               if (otherSong.name === song.name) continue;
               if (!otherSong.loaded) {
                  isEverythingLoadedNow = false;
               }
            }
            if (isEverythingLoadedNow) {
               setTimeout(() => {
                  this.onload();
               }, 1000);
               // to make sure that its really fully loaded lol.
            }
         }
         song.audio.addEventListener('canplaythrough', onLoad.bind(this));
      });
      this.lastSongIndex = this.for === 'menu' ? Number(localStorage.getItem('menuSongIndex')) : null;
   }
   generateSongIndex() {
      return window.random(0, this.songs.length - 1);
   }
   play() {
      if (this.random) {
         const songIndex = this.lastSongIndex === null ? this.generateSongIndex() : this.getUniqueSongIndex();
         this.lastSongIndex = songIndex;
         if (this.for === 'menu') {
            localStorage.setItem('menuSongIndex', this.lastSongIndex);
         }
         this.songs[songIndex].play();
         this.songs[songIndex].audio.playbackRate = 1;
         this.songs[songIndex].audio.addEventListener('ended', onEnd.bind(this));
         function onEnd() {
            this.songs[songIndex].audio.removeEventListener('ended', onEnd);
            this.songs[songIndex].audio.currentTime = 0;
            this.play();
         }
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
