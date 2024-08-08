import Handlebars from 'handlebars';
import marked from 'marked';
import typogr from 'typogr';
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

module.exports = function markdown(context) {
	let text = context.fn(this);
	let indent = text.match(/^\s+/);

	if (indent) {
		indent = JSON.stringify(indent[0]);
		indent = indent.substr(1, indent.length - 2);

		const re = new RegExp(`^${indent}`, 'gm');

		text = text.replace(re, '');
	}

	return new Handlebars.SafeString(typogr(marked(text)).typogrify());
};
