import Song from '../class/Song.js';

export default function loadSound(name) {
   return new Song(name);
}
