// import nodeResolve from 'rollup-plugin-node-resolve';
import argv from './util/argv';
import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import browserSync from './util/browser-sync';
import cjs from 'rollup-plugin-commonjs';
import cssnano from 'cssnano';
import data from 'gulp-data';
import del from 'del';
import eslint from 'gulp-eslint';
import ghPages from 'gulp-gh-pages';
import handlebars from 'gulp-hb';
import htmlmin from 'gulp-htmlmin';
import matter from 'gray-matter';
import mqpacker from 'css-mqpacker';
import nav from 'gulp-nav';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import RevAll from 'gulp-rev-all';
import sass from 'gulp-sass';
import uglify from 'rollup-plugin-uglify';
import { dest, parallel, series, src, task, watch } from 'gulp';
import { rollup } from 'rollup';

const publishing = argv._.indexOf('publish') !== -1;

// Tasks
task('clean', () => del(['./dist']));
task('clean-publish', () => del(['./.publish']));

task('codestyle', function codestyle() {
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
			// nodeResolve({
			// 	jsnext: true,
			// 	main: true,
			// 	browser: true,
			// 	builtins: false,
			// }),
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
		sourceMap: !publishing,
	}).then(bundle => bundle.write({
		format: 'cjs',
		dest: 'dist/assets/bundle.js',
		// sourceMap: !publishing,
	}));
}));

task('styles', () => src('src/styles/main.scss')
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
	.pipe(dest('dist/assets')));

task('content-assets', function contentAssets() {
	return src([
		'content/**/*',
		'!content/**/*.hbs',
	])
	.pipe(dest('dist'));
});

task('content', parallel('content-assets', () => src('content/**/*.hbs')
	.pipe(rename(p => {
		p.extname = '.html';
	}))
	.pipe(data(file => {
		const fm = matter(String(file.contents));

		file.contents = new Buffer(fm.content);

		return fm.data;
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
			isPublishing: publishing,
		},
		dataEach(context, file) {
			Object.keys(file.data).forEach(key => {
				context[key] = file.data[key];

				delete file.data[key];
				delete context.file.data[key];
			});

			return context;
		},
	}))
	.pipe(htmlmin({
		collapseWhitespace: true,
	}))
	.pipe(dest('dist'))));

task('static', function files() {
	return src('src/static/**/*')
	.pipe(dest('dist'));
});

task('build', series('clean', parallel('styles', 'scripts', 'content')));

task('publish', series(parallel('build', 'static'), 'clean-publish', () => {
	const dont = [
		'favicon.ico',
		'apple-touch-icon-precomposed.png',
		'pinned.svg',
		'.html',
		'.txt',
		'.xml',
	];
	const revAll = new RevAll({
		dontRenameFile: dont,
		dontUpdateReference: dont,
		prefix: '//pichfl.github.io/talks/',
	});

	return src('dist/**/*')
	.pipe(revAll.revision())
	.pipe(ghPages({
		message: argv.m,
	}));
}, parallel('clean', 'clean-publish')));

task('reload', done => {
	browserSync.reload();

	return done();
});

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
		'gulpfile.js',
		'content/**/*',
		'src/partials/**/*.hbs',
		'src/helpers/**/*.js',
	], parallel('codestyle', series('content', 'reload')));
	watch('src/styles/**/*.scss', series('styles', 'reload'));
	watch('src/scripts/**/*.js', parallel('scripts', 'reload'));
});

task('default', series('build', 'watch'));
