module.exports = function (grunt) {
    grunt.initConfig({
        compass: {
            dist: {
                options: {
                    config: ['skin/frontend/svp/sortedmenu/scss/config.rb']
                }
            }
        },
        watch: {
            compass: {
                files: ['skin/frontend/svp/sortedmenu/scss/**/*.scss'], // which files to watch
                tasks: ['compass']
            },
            autoprefixer: {
                files: ['skin/frontend/svp/sortedmenu/css/styles.css'],
                tasks: ['autoprefixer']
            }
        },
        autoprefixer: {
            options: {
                // Configured supported browser versions
                browsers: ['last 2 versions', 'ie 8', 'ie 9']
            },
            dev: {
                expand: true,
                flatten: true,
                src: 'skin/frontend/svp/sortedmenu/css/styles.css',
                dest: 'skin/frontend/svp/sortedmenu/css/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-watch');
};