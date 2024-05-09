// This is all very "My first gulpfile",
// by @Sheerman, a longtime CodeKit user.
// Please don't judge too harshly.

'use strict';

import plugins from 'gulp-load-plugins';
// import browserSync from 'browser-sync';
import gulp from 'gulp';
import rename from 'gulp-rename';
import yaml from 'js-yaml';
import fs from 'fs';
// import webpackStream from 'webpack-stream';
// import webpack from 'webpack';
import named from 'vinyl-named';
import include from 'gulp-include';
import autoprefixer from 'autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
// import terser from 'gulp-terser';
import eslint from 'gulp-eslint';

const $ = plugins();

const path = require('path');
const fractal = module.exports = require('@frctl/fractal').create();
const twigAdapter = require('@frctl/twig');
const mandelbrot = require('@frctl/mandelbrot');

const logger = fractal.cli.console; // keep a reference to the fractal CLI
                                    // console utility


// Give it a name
fractal.set('project.title', 'University of Staffordshire - 2024 Brand');
fractal.set('project.version', '0.3');
fractal.set('project.author', 'Chris Goostry');

// Setup Twig Adapter
fractal.components.engine(twigAdapter);
fractal.components.set('ext', '.twig');

// Set the paths
fractal.components.set('path', __dirname + '/src/components');
fractal.docs.set('path', __dirname + '/src/docs');
fractal.web.set('static.path', __dirname + '/src/assets');
fractal.web.set('builder.dest', __dirname + '/design-system');

// Set the default status of components to Work In Progress, and add some custom
fractal.components.set('default.status', 'wip');

fractal.components.set('statuses', {
  ready: {
    label: "Ready",
    description: "Component ready for use.",
    color: "#29cc29"
  },
  wip: {
    label: "WIP",
    description: "Work in progress. Reference with caution.",
    color: "#ff9233"
  },
  caution: {
    label: "Caution",
    description: "Deprecated, or to be deprecated, reference with extreme caution.",
    color: "#d70a26"
  },
  reference: {
    label: "Reference",
    description: "Documentation or reference purposes.",
    color: "#2999cc"
  }
});

// Set some placeholder copy
fractal.components.set('default.context', {
  'placeholderHeadline': 'Graduates give Staffs Uni star role in popular app',
  'placeholderHeadline2': 'Enjoying the View? How computer games can help evaluate landscapes',
  'placeholderHeadline3': '“It\'s Beautiful to be Old” Professor tells Vatican',
  'placeholderHeadline4': 'Research into poverty in Stoke-on-Trent gets new funding boost',
  'placeholderPara1': 'The founders of an immersive storytelling app have returned to their university stomping ground to film their latest episode.',
  'placeholderPara2': 'Staffordshire University is going global with a programme packed full of free events to start the new decade.',
  'placeholderPara3': '2020 marks the International Year of the Nurse and Midwife, and Staffordshire University is joining colleagues across the globe to shine a spotlight on the sector. Celebrations kick off with a talk this week by Visiting Professor Ann-Marie Cannaby, Chief Nurse at the Royal Wolverhampton Hospital, at the University’s Centre of Excellence in Healthcare Education, Stafford.Two hundred years may have passed since the birth of Florence Nightingale, but patient care and safety remain the most important influencing factors within the fields of nursing and midwifery. Professor Cannaby will use her keynote presentation to explore curriculum developments.',
  'lorem': 'Lipsum has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  'loremLong': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  'loremShort': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
  'pangram': 'The quick brown fox jumps over the lazy dog',
  main_menu: {
    "items": [
      {
        title: 'Title',
        link: '/'
      },
    ],
  },
});

// Customise the Fractal theme
const myCustomisedTheme = mandelbrot({
  "skin": 'white',
  "nav": ["search", "docs", "components"],
  "panels": ["notes", "html", "view", "resources", "info"],
  information: [
      {
          label: 'Built on',
          value: new Date(),
          type: 'time', // Outputs a <time /> HTML tag
          format: (value) => {
              return value.toLocaleDateString('en');
          }
      }
    ]
});
fractal.web.theme(myCustomisedTheme);


/*
 * Start the Fractal server
 *
 * In this example we are passing the option 'sync: true' which means that it will
 * use BrowserSync to watch for changes to the filesystem and refresh the browser automatically.
 * Obviously this is completely optional!
 *
 * This task will also log any errors to the console.
 */

function fractalDev() {
  const server = fractal.web.server({
    sync: true,
    syncOptions: {
      open: 'local'
    }
  });
  server.on('error', err => logger.error(err.message));
  return server.start().then(() => {
    logger.success(`Fractal server is now running at ${server.url}`);
  });
}

/*
 * Run a static export of the project web UI.
 *
 * This task will report on progress using the 'progress' event emitted by the
 * builder instance, and log any errors to the terminal.
 *
 * The build destination will be the directory specified in the 'builder.dest'
 * configuration option set above.
 */

function fractalBuild() {
  const builder = fractal.web.builder();
  builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
  builder.on('error', err => logger.error(err.message));
  return builder.build().then(() => {
    logger.success('Fractal build completed!');
  });
}


var {
  HOST_URL,
  COMPATIBILITY,
  PATHS
} = loadConfig();
var assets_use_path = PATHS.assets.dev;

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

gulp.task('default', gulp.series(setDev, fractalDev, gulp.parallel(sass, js), watch));
gulp.task('build', gulp.series(fractalBuild));
gulp.task('deploy', gulp.series(fractalBuild, gulp.parallel(setProd, sassDist, js)));
// gulp.task('images', gulp.series(setDev, themeImageMin));

// function server(done) {
//   browserSync.init({
//     proxy: HOST_URL,
//     open: false
//   });
//   done();
// }

function setDev(done) {
  process.env.NODE_ENV = 'development';
  done();
}

function setProd(done) {
  process.env.NODE_ENV = 'production';
  assets_use_path = PATHS.assets.dist;
  done();
}

function sass() {

  const postCssPlugins = [autoprefixer()].filter(Boolean);

  return gulp.src(PATHS.watch.sass)
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        includePaths: PATHS.sass,
        outputStyle: 'compact',
        precision: 4
      }).on('error', $.sass.logError))
      .pipe($.postcss(postCssPlugins))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(PATHS.assets.dev.css))
  // .pipe(browserSync.reload({
  //   stream: true
  // }))
}

function sassDist() {

  const postCssPlugins = [autoprefixer()].filter(Boolean);

  return gulp.src(PATHS.watch.sass)
      .pipe($.sass({
        includePaths: PATHS.sass
      }).on('error', $.sass.logError))
      .pipe($.postcss(postCssPlugins))
      .pipe($.cleanCss())
      .pipe(gulp.dest(PATHS.assets.dist.css))
}

function js() {
  return gulp.src(PATHS.js)
      .pipe(sourcemaps.init())
      .on('error', logAndContinueError)
      .pipe(eslint())
      .on('error', logAndContinueError)
      .pipe(include())
      .on('error', logAndContinueError)
      .pipe(named())
      .on('error', logAndContinueError)
      // .pipe(webpackStream(require("./webpack.config.js"), webpack))
      .pipe(babel({
        presets: ['@babel/env']
      }))
      .on('error', logAndContinueError)
      .pipe(sourcemaps.write('.'))
      .on('error', logAndContinueError)
      // .pipe(terser())
      .on('error', logAndContinueError)
      // .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(assets_use_path.js))
}

// function themeImageMin() {
//   return gulp.src('./img/**/*')
//       .pipe($.imagemin())
//       .pipe(gulp.dest('./img'));
// }

// function uploadImageMin() {
//   return gulp.src('../../uploads/**/*')
//       .pipe($.imagemin())
//       .pipe(gulp.dest('../../uploads/'));
// }

// function reloadWindows(done) {
//   browserSync.reload()
//   done();
// }

function logAndContinueError(e) {
  console.log('>>> ERROR', e);
  this.emit('end');
}

function watch() {
  gulp.watch('config.yml', gulp.series(function (done) {
    PATHS = loadConfig().PATHS;
    done();
  }, gulp.parallel(js, sass)));
  gulp.watch(PATHS.watch.sass, sass);
  gulp.watch(PATHS.watch.js, js);
  // gulp.watch(PATHS.watch.php, gulp.parallel(reloadWindows));
}