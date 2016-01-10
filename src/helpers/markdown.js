import marked from 'marked';
import Handlebars from 'handlebars';

marked.setOptions({
	smartypants: true
});

module.exports = function markdown(context) {
	let text = context.fn(this);
	let indent = text.match(/^\s+/);

	if (indent) {
		indent = JSON.stringify(indent[0]);
		indent = indent.substr(1,indent.length-2);

		const re = new RegExp('^'+indent,'gm')

		text = text.replace(re, '');
	}

	return new Handlebars.SafeString(marked(text));
}
