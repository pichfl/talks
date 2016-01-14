import cycle from './cycle-array';

// make css aware of active JS
document.documentElement.classList.add('js');

// Store all available targets to array
const targets = [...document.querySelectorAll('article section[id]')].map(link => link.id);

// Force start on first target
if (!window.location.hash) {
	window.location.hash = targets[0];
}

window.addEventListener('keydown', event => {
	const { keyCode } = event; // Left = 37, Up = 38, Right = 39, Down = 40

	switch (keyCode) {
	case 35: // End
		window.location.hash = targets[targets.length - 1];
		break;
	case 36: // Home
		window.location.hash = targets[0];
		break;
	case 37: // Left
	case 38: // Up
		window.location.hash = cycle(targets, -1);
		break;
	case 39: // Right
	case 40: // Down
		window.location.hash = cycle(targets, 1);
		break;
	default:
		break;
	}
});
