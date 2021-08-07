import Vec from './vector.js';

export default class Camera {
   constructor(x, y, angle, viewAngle, viewRadius, rotating = false, rotatingSpeed = Math.PI / 2, canTamper = true) {
      this.radius = 25;
      this.pos = new Vec(x, y);
      this.angle = degToRad(angle);
      this.viewAngle = degToRad(viewAngle);
      this.viewRadius = viewRadius;
      this.canTamper = canTamper;
      this.rotating = rotating;
      this.rotatingSpeed = rotatingSpeed;
      this.disabled = false;
      // this.points = [];
   }
   touchingBullet(bullet) {
      const distX = bullet.pos.x - this.pos.x;
      const distY = bullet.pos.y - this.pos.y;
      const colliding = distX * distX + distY * distY < (bullet.radius + this.radius) ** 2;
      return colliding;
   }
   disable() {
      this.disabled = true;
   }
   update(state, delta) {
      if (this.rotating) {
         this.angle += this.rotatingSpeed * delta;
      }
      // this.points = Ray.getPoints(this.pos, uniquePoints, state.lines, this.size / 2);
   }
   render({ ctx, canvas }) {
      const pos = offset(this.pos);
      ctx.translate(pos.x, pos.y);
      ctx.fillStyle = this.disabled ? '#2e2e2e' : '#adadad';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (!this.disabled) {
         ctx.rotate(this.angle);
         const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, this.viewRadius * scale);
         gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
         gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
         ctx.globalAlpha = 0.8;
         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.moveTo(0, 0);
         ctx.arc(0, 0, this.viewRadius * scale, -this.viewAngle / 2, this.viewAngle / 2, false);
         ctx.lineTo(0, 0);
         ctx.fill();
         ctx.globalAlpha = 1;
         ctx.rotate(-this.angle);
      }
      ctx.translate(-pos.x, -pos.y);
   }
}

function degToRad(deg) {
   return (deg * Math.PI) / 180;
}
