import slides from './slides';

const doc = document;

// make css aware of active JS
doc.documentElement.classList.add('js');

//
slides(...doc.querySelectorAll('.slides section').map((slide, index) => {
	const title = slide.querySelector('h1, h2, h3, h4, h5, h6');

	return {
		title: `${title ? (title.textContent + ' - ') : ''}${index + 1}`,
		hash: slide.id,
	};
}));
