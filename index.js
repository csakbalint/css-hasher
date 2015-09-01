'use strict';
/* jshint undef: true, unused: true, node: true */

// vendor
global.Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var co = require('co');
var _ = require('underscore');
var minimist = require('minimist');

// constants
var CSS_TAG_REGEX = /(#|\.)-?[_a-zA-Z]+[_a-zA-Z0-9-]*(?=[^}]*\{)/g;
var HTML_TAG_REGEX = ['((class|id)=\\"[^"]*)', '(\\s|")'];

// params
var argv = minimist(process.argv.slice(2));

if (!argv.css || !argv.html) return console.log('No css or html file given');

var config = {
	cwd: argv.cwd || './',
	dest: argv.dest || 'haccsh/',
	prefix: argv.prefix || 'haccsv',
	index: argv.index || 'aaaaa',
	css: argv.css.split(','),
	html: argv.html.split(','),
	js: argv.js ? argv.js.split(',') : undefined,
};

var hacssh = {
	hash: {},
	sorted: [],
	set: function (str) {

		if (this.hash[str]) return;
	
		var index = config.index;
		var key = config.prefix + '-' + index;
		this.hash[str] = key;
		config.index = ((parseInt(index, 36)+1).toString(36)).replace(/0/g,'a');
	},
	sort: Promise.method(function () {

		var pairs = _.pairs(hacssh.hash);
		hacssh.sorted =  pairs.sort(function (a, b) {

			var each = a[0];
			var other = b[0];

			if (each.indexOf(other) !== -1) return -1;
			if (other.indexOf(each) !== -1) return 1;
			return each.length > other.length ? -1 : 1;
		});
		return hacssh.sorted;
	}),
	loadCss: function (cssFiles) {

		return Promise.map(cssFiles, co.wrap(function* (cssFile) {

			var css = yield fs.readFileAsync(config.cwd + cssFile, 'utf8');
			var match;
			while(!!(match = CSS_TAG_REGEX.exec(css))) {
				
				var str = match[0];
				hacssh.set(str);
			}
			return true;
		}));
	},
	parseCss: function (cssFiles) {
	
		return Promise.map(cssFiles, co.wrap(function* (cssFile) {

			var css = yield fs.readFileAsync(config.cwd + cssFile, 'utf8');
			_.each(hacssh.sorted, function (pair) {

				css = css.replace(new RegExp('\\' + pair[0], 'g'), '.' + pair[1]);
			});
			return yield fs.writeFileAsync(config.cwd + config.dest + cssFile, css);
		}));
	},
	parseHtml: function (htmlFiles) {

		return Promise.map(htmlFiles, co.wrap(function* (htmlFile) {

			var html = yield fs.readFileAsync(config.cwd + htmlFile, 'utf8');
			_.each(hacssh.sorted, function (pair) {

				var str = HTML_TAG_REGEX[0] + pair[0].slice(1) + HTML_TAG_REGEX[1];
				html = html.replace(new RegExp(str, 'g'), '$1' + pair[1] + '$3');
			});
			return yield fs.writeFileAsync(config.cwd + config.dest + htmlFile, html);
		}));
	},
	parseJs: function () {

		
	},
	run: co.wrap(function* () {

		yield hacssh.loadCss(config.css);
		yield hacssh.sort(); 
		yield hacssh.parseCss(config.css);
		yield hacssh.parseHtml(config.html);
	})
};

module.exports = hacssh;

if (!module.parent) {
	
	hacssh();
}
