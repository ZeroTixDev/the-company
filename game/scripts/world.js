import Rect from './rect.js';

export default class World extends Rect {
   constructor(width, height) {
      super(0, 0, width, height);
   }
   render({ ctx, canvas }) {
      const pos = offset({ x: 0, y: 0 });
      ctx.lineWidth = strokeSize;
      ctx.strokeStyle = 'white';
      ctx.strokeRect(pos.x, pos.y, this.width * scale, this.height * scale);
   }
}
