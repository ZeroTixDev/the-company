import Vec from './vector.js';

export default class Camera {
   constructor(x, y, angle, viewAngle, viewRadius, rotating = false, rotatingSpeed = 90, canTamper = true) {
      this.size = 40;
      this.pos = new Vec(x, y);
      this.angle = degToRad(angle);
      this.viewAngle = degToRad(viewAngle);
      this.viewRadius = viewRadius;
      this.canTamper = canTamper;
      this.rotating = rotating;
      this.rotatingSpeed = rotatingSpeed;
      // this.points = [];
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
      ctx.fillStyle = 'gray';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.rect((-this.size / 2) * scale, (-this.size / 2) * scale, this.size * scale, this.size * scale);
      ctx.fill();
      ctx.stroke();
      ctx.rotate(-this.angle);
      ctx.translate(-pos.x, -pos.y);
   }
}

function degToRad(deg) {
   return (deg * Math.PI) / 180;
}
