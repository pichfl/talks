import argv from './gulp/argv';
import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import browserSync from './gulp/browser-sync';
import cjs from 'rollup-plugin-commonjs';
import cssnano from 'cssnano';
import data from 'gulp-data';
import del from 'del';
import eslint from 'gulp-eslint';
import ghPages from 'gulp-gh-pages';
import handlebars from 'gulp-hb';
import matter from 'gray-matter';
import mqpacker from 'css-mqpacker';
import nav from 'gulp-nav';
import npm from 'rollup-plugin-npm';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import RevAll from 'gulp-rev-all';
import sass from 'gulp-sass';
import uglify from 'rollup-plugin-uglify';
import { dest, parallel, series, src, task, watch } from 'gulp';
import { rollup } from 'rollup';

// Tasks
task('clean', () => del(['./dist']));
task('clean-publish', () => del(['./.publish']));

task('codestyle', () => {
	return src([
		'src/**/*.js',
		'gulpfile.babel.js',
		'gulp/**/*.js',
	])
	.pipe(eslint())
	.pipe(eslint.format());
});

task('scripts', parallel('codestyle', function bundler() {
	return rollup({
		entry: 'src/scripts/main.js',
		plugins: [
			npm({
				jsnext: true,
				main: true,
				browser: true,
				builtins: false,
			}),
			cjs(),
			babel({
				exclude: 'node_modules/**',
				runtimeHelpers: true,
				babelrc: false,
				presets: [
					'es2015-rollup',
					'stage-0',
				],
			}),
			uglify(),
		],
		sourceMap: true,
	}).then(bundle => bundle.write({
		format: 'cjs',
		dest: 'dist/assets/bundle.js',
		sourceMap: true,
	}));
}));

task('styles', () => {
	return src('src/styles/main.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(postcss([
		autoprefixer({
			browsers: ['last 2 versions'],
		}),
		mqpacker({
			sort: true,
		}),
		cssnano({
			autoprefixer: false,
		}),
	]))
	.pipe(dest('dist/assets'));
});

task('content-assets', function () {
	return src([
		'content/**/*',
		'!content/**/*.hbs',
	])
	.pipe(dest('dist'));
});

task('content', parallel('content-assets', () => {
	return src('content/**/*.hbs')
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
}));

task('static', function () {
	return src('src/static/**/*')
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
		message: argv.m,
	}));
}, parallel('clean', 'clean-publish')));

task('watch', () => {
	browserSync.init({
		ghostMode: false,
		server: {
			baseDir: ['dist', 'src/static'],
		},
		notify: false,
		injectChanges: false,
		open: false,
	});

	watch([
		'content/**/*',
		'src/partials/**/*.hbs',
		'src/helpers/**/*.js',
	], parallel('codestyle', series('content', browserSync.reload)));
	watch('src/styles/**/*.scss', series('styles', browserSync.reload));
	watch('src/scripts/**/*.js', parallel('scripts'));
});

task('default', series('build', 'watch'));
