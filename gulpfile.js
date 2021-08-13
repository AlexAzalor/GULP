// ВНИМАНИЕ! ДЛЯ РАБОТЫ ВВЕСТИ npm i 
const { src, dest, watch, parallel, series } = require('gulp');

const scss          = require('gulp-sass')(require('sass'));
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create(); // 1)npm install -g browser-sync, 2)npm i --save-dev browser-sync
const uglify        = require('gulp-uglify-es').default; // terminal: npm i --save-dev gulp-uglify-es. на видосе 1ч 15 мин
const autoprefixer  = require('gulp-autoprefixer'); //как я понял это для того чтобы в стархы браузерах все норм шло
const imagemin      = require('gulp-imagemin'); // у меня не ставило. наверное потмоу что на сайте 8 серия, а у чувка и у меня одинаковые. или хз ваще...
const del           = require('del');


function browsersync() { // c сайта документации browserSync взяли запись, тут новее.
    browserSync.init({
        server : {
            baseDir: 'app/'
        }
    });
}

function cleanDist() { // видео 1ч 54м. запутано оч. В конце этого кода расписал про эту функцию и ПРАВИЛЬНОЕ удаление
    return del('dist')
}


function images() {   //Сжимает вес картинок. было 43 кб стало 30.
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function scripts() { //npm i --save-dev jquery, а потом прописать путь к этой папке созданной в нод модуль
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js')) // обьеденем в единый файл
    .pipe(uglify())             //потом мимифицирую
    .pipe(dest('app/js'))       //и выкидую в папку js
    .pipe(browserSync.stream()); //для автообновления страницы
}



function styles() {  //из препроцессора scss будет конвертироватся в css
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))    //пример с трубой и водой. минута видео - 34. {outputStyle: 'compressed'} - это делает запись в одной строке. сжато.
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))   //прописываем куда выкинуть, типа куда "вода выйдет"
        .pipe(browserSync.stream()); //ДЛЯ CSS строка. - это для того чтобы страница в браузере сама обновлялась.

}

function build() {   //видео 1ч 40 мин. - не до конца понял что он делает
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
        .pipe(dest('dist'))
}


function watching() {
    watch(['app/scss/**/*.scss'], styles); // .../**/ - это значит что функция будет иметь дело с бесконечным количеством папок, КОТОРЫЕ /*.scss - заканчиваются на этот постфикс.
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); // "gulp" in terminal for tests. Будут следить за всеми файлами .js КРОМЕ "!..." ЭТОГО. До этого был бесконечный цикл где функция жонглировала файлами туда-сюда. видео 1ч 25м
    watch(['app/*html']).on('change', browserSync.reload);
}


exports.styles = styles; //для решение проблемы заметил ошибку в 8 строке и под видосом в коментах. css -> scss
exports.watching = watching; //автоматически следит за проэктом и сам обновляет style.min.css
//gulp watching - старт автообновление. ctrl+c остановить. Потому что консолька не может выполнять больше одной задачи.
exports.browsersync = browsersync; // gulp browsersync
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build); // все идет по порядку. это для правильного удаления... Тяжело пока что понимать всю картину
exports.default = parallel(styles, scripts, browsersync, watching); //с кавычками это Object.<anonymous>, т.е. проста строка, которая нечего не делает и поэтому ошибка


// npm i del --save-dev --- важный плагин, чтобы при удалении не оставался мусор.
// Он сказал что если удалить картинку с папки и нажать ГАЛП БИЛД то картинка вернется.
// и поэтому этот плагин контрит эту тему.
// надеюсь понял...
//Создаю файл, нажимаю в терминале gulp build
// файл идет в папку ДИСТ
// если я удаляю этот файл из корня то в ДИСТЕ  он не удаляется!
// нужно опять нажать gulp build и тогда выполнится та серия с cleanDist
// и все будет чисто и в порядке. не будет лишнего мусора в файлах