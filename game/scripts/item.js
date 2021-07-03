import Vec from './vector.js';

export default class Item {
   constructor(x, y) {
      this.pos = new Vec(x, y);
   }
   renderPos() {
      return offset(this.pos);
   }
}
