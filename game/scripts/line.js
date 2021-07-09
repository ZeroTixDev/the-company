import Vec from './vector.js';

export default class Line {
   constructor(startX, startY, endX, endY) {
      this.start = new Vec(startX, startY);
      this.end = new Vec(endX, endY);
   }
   render(ctx) {
      ctx.strokeStyle = 'rgb(147, 129, 86)';
      ctx.lineWidth = strokeSize * 5;
      const start = offset(this.start);
      const end = offset(this.end);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
   }
}
