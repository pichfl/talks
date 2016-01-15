import marked from 'marked';
import Handlebars from 'handlebars';
import { highlight, highlightAuto } from 'highlight.js';

marked.setOptions({
	smartypants: true,

	highlight(code, lang) {
		if (lang) {
			return highlight(lang, code).value;
		}

		return highlightAuto(code).value;
	},
});

/**
 * Transforms

	```markdown
		==== #id .class
		...
	```

	to

	```html
		<article class="slides">
			<section id="id" class="slides__slide--class">
				...
			</section>
		</article>
	```

 * @param  {object} context
 * @return {string}
 */
module.exports = function markdown(context) {
	let text = context.fn(this);
	let indent = text.match(/^\s+/);

	if (indent) {
		indent = JSON.stringify(indent[0]);
		indent = indent.substr(1, indent.length - 2);

		const re = new RegExp(`^${indent}`, 'gm');

		text = text.replace(re, '');
	}

	const splitted = text.trim().split(/(====\s#.*\n)/im);
	const slides = [];

	for (let i = 1; i < splitted.length; i += 2) {
		const meta = (splitted[i] || '').split(' ');
		const hash = ((meta[1] || '').match(/#([A-Za-z0-9_-]+)/) || [])[1];
		const type = ((meta[2] || '').match(/\.([A-Za-z0-9_-]+)/) || [])[1];

		slides.push({
			hash,
			type,
			content: splitted[i + 1],
		});
	}

	text = slides.map((slide, index) => {
		const hash = slide.hash || `slide-${index}`;
		const type = 'slides__slide' + (slide.type ? `--${slide.type}` : '');
		const content = marked(slide.content);

		return `			<section id="${hash}" class="${type}">
				${content}
			</section>\n`;
	}).join('');

	return new Handlebars.SafeString(`		<article class="slides">
			${text}
		</article>
	`);
};
