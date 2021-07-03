import Vec from './vector.js';
import Item from './item.js';

export default class Bag extends Item {
   constructor(x, y, content = null) {
      super(x, y);
      this.content = content;
      this.radius = 40;
      this.bag = true;
   }
   collide(player) {
      const distX = player.pos.x - this.pos.x;
      const distY = player.pos.y - this.pos.y;
      return distX * distX + distY * distY < (player.radius + this.radius) ** 2;
   }
   intersects(point) {
      const distX = point.x - this.pos.x;
      const distY = point.y - this.pos.y;
      return Math.sqrt(distX * distX + distY * distY) < this.radius + strokeSize * 2;
   }
   showHoverData(ctx) {
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = 'white';
      ctx.fillRect(
         offset(new Vec(this.pos.x - this.radius, 0)).x,
         offset(new Vec(0, this.pos.y - this.radius * 2)).y,
         this.radius * 2 * scale,
         this.radius * 0.8 * scale
      );
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${30 * scale}px Harmattan`;
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 3 * scale;
      ctx.shadowOffsetY = 3 * scale;
      ctx.fillText('BAG', this.renderPos().x, offset(new Vec(this.pos.x, this.pos.y - this.radius * 1.5)).y);
      ctx.restore();
   }
   render({ ctx, canvas }) {
      ctx.fillStyle = '#61440e';
      ctx.strokeStyle = '#261900';
      ctx.lineWidth = strokeSize * 2;
      const pos = this.renderPos();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
   }
}
