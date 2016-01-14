import typogr from 'typogr';
import Handlebars from 'handlebars';

module.exports = function markdown(context) {
	return new Handlebars.SafeString(typogr(context.fn(this)).typogrify());
};
