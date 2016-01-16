// make css aware of active JS
document.documentElement.classList.add('js');

// Store all available targets to array
const win = window;
const targets = [...document.querySelectorAll('article section[id]')].map(link => link.id);
const currentIndex = targets.indexOf(win.location.hash.substr(1));

let index = currentIndex < 0 ? 0 : currentIndex;

if (!win.location.hash) {
	win.location.hash = targets[index];
}

function cycle(arr, direction) {
	const length = arr.length;
	index = index + direction;

	if (index > length - 1) {
		index = 0;
	}

	if (index < 0) {
		index = length - 1;
	}

	return arr[index];
}

win.addEventListener('keydown', event => {
	const { keyCode } = event; // Left = 37, Up = 38, Right = 39, Down = 40

	switch (keyCode) {
	case 35: // End
		win.location.hash = targets[targets.length - 1];
		break;
	case 36: // Home
		win.location.hash = targets[0];
		break;
	case 37: // Left
	case 38: // Up
		win.location.hash = cycle(targets, -1);
		break;
	case 39: // Right
	case 40: // Down
		win.location.hash = cycle(targets, 1);
		break;
	default:
		break;
	}
});
