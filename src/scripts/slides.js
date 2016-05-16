const doc = document;
const win = window;

export class Slides {
	constructor(slidesArray, options) {
		this.options = Object.assign({
			title: `${doc.title}`,
		}, options);

		this.current = 0;
		this.slides = slidesArray;

		if (slidesArray.length) {
			this.go(this.initialIndex);
			this.attach();
		}
	}

	get initialIndex() {
		if (win.location.hash) {
			const hash = win.location.hash.substr(1);

			return this.slides.findIndex(slide => slide.hash === hash) || 0;
		}

		return 0;
	}

	go(dest) {
		const index = (dest < 0) ? (this.slides.length - 1 - dest) : dest;
		const slide = this.slides[index];

		this.current = index;
		win.location.hash = slide.hash;
		doc.title = `${slide.title} - ${this.options.title}`;
	}

	next() {
		let n = this.current + 1;

		if (n >= this.slides.length) {
			n = 0;
		}

		this.go(n);
	}

	previous() {
		let p = this.current - 1;

		if (p < 0) {
			p = this.slides.length - 1;
		}

		this.go(p);
	}

	onKeyDown(event) {
		const { keyCode } = event; // Left = 37, Up = 38, Right = 39, Down = 40

		switch (keyCode) {
		case 35: // End
			this.go(-1);
			break;
		case 36: // Home
			this.go(0);
			break;
		case 37: // Left
		case 38: // Up
			this.previous();
			break;
		case 39: // Right
		case 40: // Down
			this.next();
			break;
		default:
			break;
		}
	}

	attach() {
		this.onKeyDownBound = this.onKeyDown.bind(this);

		win.addEventListener('keydown', this.onKeyDownBound);
	}
}

export default function slides(selector, options) {
	return new Slides(selector, options);
}
