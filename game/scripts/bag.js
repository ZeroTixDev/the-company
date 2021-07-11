import Item from './item.js';

export default class Bag extends Item {
   constructor(x, y, content = null) {
      super(x, y);
      this.content = content;
      this.radius = 40;
      this.bag = true;
      this.timeToPickUp = 1;
      this.holdingProgress = 0;
      this.pickingUp = false;
      this.hold = true;
   }
   update() {
      if (!this.pickingUp) {
         this.holdingProgress = 0;
      }
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
   render({ ctx, canvas }) {
      ctx.fillStyle = '#61440e';
      ctx.strokeStyle = '#261900';
      ctx.lineWidth = strokeSize * 2;
      ctx.globalAlpha = 0.8;
      const pos = this.renderPos();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
   }
}
