import moment from 'moment';
import Handlebars from 'handlebars';

module.exports = function (format, date) {
	let m = moment();

	if (typeof date === 'string') {
		m = moment(date);
	}

	return new Handlebars.SafeString(m.format(format));
};
