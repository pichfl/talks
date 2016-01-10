import autoprefixer from 'autoprefixer';
import argv from './gulp/argv';
import browserSync from './gulp/browser-sync';
import data from 'gulp-data';
import del from 'del';
import eslint from 'gulp-eslint';
import ghPages from 'gulp-gh-pages';
import handlebars from 'gulp-hb';
import matter from 'gray-matter';
import mqpacker from 'css-mqpacker';
import nav from 'gulp-nav';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import RevAll from 'gulp-rev-all';
import sass from 'gulp-sass';
import { dest, lastRun, parallel, series, src, task, watch } from 'gulp';

task('clean', () => del(['./dist']));
task('clean-publish', () => del(['./.publish']));

task('scripts', () => {
	return src('src/scripts/index.js')
	.pipe(dest('dist/assets'));
});

task('styles', () => {
	return src('src/styles/main.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(postcss([
		autoprefixer({
			browsers: ['last 3 versions'],
		}),
		mqpacker({
			sort: true,
		}),
	]))
	.pipe(dest('dist/assets'));
});

task('content', () => {
	return src('src/content/**/*.hbs')
	.pipe(rename(p => {
			p.extname = '.html';
		}))
	.pipe(data(file => {
		const content = matter(String(file.contents));

		file.contents = new Buffer(content.content);

		return content.data;
	}))
	.pipe(nav({
		skips: 'ignore',
	}))
	.pipe(handlebars({
		helpers: ['src/helpers/**/*.js'],
		partials: ['src/partials/**/*.hbs'],
		bustCache: true,
		data: {
			argv,
		},
	}))
	.pipe(dest('dist'));
});

task('static', function() {
	return src('static/**/*')
	.pipe(dest('dist'));
});

task('build', series('clean', parallel('styles', 'scripts', 'content')));

task('collect', parallel('build', 'static'));

task('publish', series('build', () => {
	const revAll = new RevAll({
		dontRenameFile: [
			'favicon.ico',
			'apple-touch-icon-precomposed.png',
			'pinned.svg',
			'.html',
			'.txt',
			'.xml',
		],
		prefix: '//pichfl.github.io/talks/',
	});

	return src('dist/**/*')
	.pipe(revAll.revision())
	.pipe(ghPages({
		message: argv.m
	}));
}, 'clean-publish'));

task('watch', () => {
	browserSync.init({
		ghostMode: false,
		server: {
			baseDir: ['dist', 'static'],
		},
		notify: false,
		injectChanges: false,
		open: false,
	});

	watch([
		'src/content/**/*.hbs',
		'src/partials/**/*.hbs',
		'src/helpers/**/*.js'
	], series('content', browserSync.reload));
	watch('src/styles/**/*.scss', series('styles', browserSync.reload));
	watch('src/scripts/**/*.js', parallel('scripts'));
});

task('default', series('build', 'watch'));
