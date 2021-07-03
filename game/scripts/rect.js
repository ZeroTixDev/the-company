import Line from './line.js';

export default class Rect {
   constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
   }
   lines() {
      return [
         new Line(this.x, this.y, this.x + this.width, this.y), // top
         new Line(this.x, this.y + this.height, this.x + this.width, this.y + this.height), // bottom
         new Line(this.x, this.y, this.x, this.y + this.height), //left
         new Line(this.x + this.width, this.y, this.x + this.width, this.y + this.height), //right
      ];
   }
}
