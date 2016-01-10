import typogr from 'typogr';
import Handlebars from 'handlebars';

module.exports = function markdown(context) {
	let text = context.fn(this);

	return new Handlebars.SafeString(typogr(text).typogrify());
}
