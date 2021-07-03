import Rect from './rect.js';

export default class Obstacle extends Rect {
   constructor(x, y, width, height) {
      super(x, y, width, height);
      this.sat = new SAT.Box(new SAT.Vector(x, y), width, height).toPolygon();
   }
   render({ ctx, canvas }) {
      const pos = offset({ x: this.x, y: this.y });
      ctx.fillStyle = 'black';
      ctx.fillRect(pos.x, pos.y, this.width * scale, this.height * scale);
   }
   collide(player) {
      const rectHalfSizeX = this.width / 2;
      const rectHalfSizeY = this.height / 2;
      const rectCenterX = this.x + rectHalfSizeX;
      const rectCenterY = this.y + rectHalfSizeY;
      const distX = Math.abs(player.pos.x - rectCenterX);
      const distY = Math.abs(player.pos.y - rectCenterY);
      if (distX < rectHalfSizeX + player.radius && distY < rectHalfSizeY + player.radius) {
         const playerSat = new SAT.Circle(new SAT.Vector(player.pos.x, player.pos.y), player.radius);
         const res = new SAT.Response();
         const collision = SAT.testPolygonCircle(this.sat, playerSat, res);
         if (collision) {
            player.pos.add(res.overlapV);
         }
      }
   }
}
