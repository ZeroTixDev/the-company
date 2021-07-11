export default class Vec {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
   dist(vec) {
      return Math.sqrt((vec.x - this.x) * (vec.x - this.x) + (vec.y - this.y) * (vec.y - this.y));
   }
   add(vec) {
      this.x += vec.x;
      this.y += vec.y;
   }
   round() {
      return new Vec(Math.round(this.x), Math.round(this.y));
   }
   same(pos) {
      return this.x === pos.x && this.y === pos.y;
   }
   copy() {
      return new Vec(this.x, this.y);
   }
}
