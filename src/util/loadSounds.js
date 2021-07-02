import getAudio from './getAudio.js';
import getSounds from '../data/sounds.js';
const sounds = getSounds();

export default function load(type) {
   if (sounds[type] !== undefined) {
      const songs = [];
      sounds[type].songs.forEach((name) => {
         songs.push(getAudio(name));
      });
      return { ...sounds[type], songs };
   }
}
