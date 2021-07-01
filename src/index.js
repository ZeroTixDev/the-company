const canvas = document.querySelector('.game-canvas');
const ctx = canvas.getContext('2d');

window.addEventListener('load', () => {
	resize();
})

window.addEventListener('resize', resize);

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function render() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {

}

;(function run() {
	update();
	render();
	requestAnimationFrame(run);
})()