import Item from './item.js';
import Guns from '../data/gun.js';

export default class Gun extends Item {
   constructor(x, y, type = null, ammo = 0) {
      super(x, y);
      this.type = type;
      this.gun = true;
      this.radius = 48;
      this.ammo = ammo;
      this.data = Guns[this.type];
   }
   copy(pos = null) {
      if (pos == null) {
         return new Gun(this.pos.x, this.pos.y, this.type, this.ammo);
      } else {
         return new Gun(pos.x, pos.y, this.type, this.ammo);
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
   canShoot(player, state, mouseDown) {
      return this.data.canShoot === undefined ? true : this.data.canShoot(player, state, this, mouseDown);
   }
   simulate(delta) {
      if (this.data.update !== undefined) {
         this.data.update(this, mouseDown, delta);
      }
   }
   render({ ctx, canvas }) {
      ctx.fillStyle = 'rgb(25, 25, 25)';
      ctx.strokeStyle = this.data?.color;
      ctx.lineWidth = strokeSize * 3;
      ctx.globalAlpha = 1;
      ctx.shadowOffsetY = 0;
      ctx.shadowOffsetX = 0;
      const pos = this.renderPos();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      // ctx.stroke();
      ctx.globalAlpha = 1;
      if (this.data?.image) {
         ctx.imageSmoothingQuality = 'high';
         ctx.drawImage(
            this.data.image,
            Math.round(
               pos.x + (this.data.xoff === undefined ? 0 : this.data.xoff) * scale - (this.data.width / 2) * scale
            ),
            Math.round(
               pos.y + (this.data.yoff === undefined ? 0 : this.data.yoff) * scale - (this.data.height / 2) * scale
            ),
            Math.round(this.data.width * scale),
            Math.round(this.data.height * scale)
         );
      }
   }
}
