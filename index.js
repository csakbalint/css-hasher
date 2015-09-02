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

var hacssh = {
	hash: {},
	sorted: [],
	config: {
		cwd: './',
		dest: 'dist/',
		prefix: 'hacssh',
		index: 'aaaaa',
		css: [],
		html: [],
		js: [],
	},
	_set: function (str) {

		if (this.hash[str]) return;
	
		var index = hacssh.config.index;
		var key = hacssh.config.prefix + '-' + index;
		this.hash[str] = key;
		hacssh.config.index = (( parseInt(index, 36) + 1 ).toString(36)).replace(/0/g, 'a');
		return str;
	},
	_sort: function () {

		var pairs = _.pairs(hacssh.hash);
		hacssh.sorted =  pairs.sort(function (a, b) {

			var each = a[0];
			var other = b[0];

			if (each.indexOf(other) !== -1) return -1;
			if (other.indexOf(each) !== -1) return 1;
			return each.length > other.length ? -1 : 1;
		});
		return hacssh.sorted;
	},
	setConfig: Promise.method(function (config) {
		
		return hacssh.config = _.defaults(config, hacssh.config);
	}),
	loadCss: co.wrap(function* () {

		yield Promise.map(hacssh.config.css, co.wrap(function* (cssFile) {

			var css = yield fs.readFileAsync(hacssh.config.cwd + cssFile, 'utf8');
			var match;
			while(!!(match = CSS_TAG_REGEX.exec(css))) {
				
				var str = match[0];
				hacssh._set(str);
			}
			return true;
		}));
		return hacssh._sort();
	}),
	parseCss: Promise.method(function () {
	
		return Promise.map(hacssh.config.css, co.wrap(function* (cssFile) {

			var css = yield fs.readFileAsync(hacssh.config.cwd + cssFile, 'utf8');
			_.each(hacssh.sorted, function (pair) {

				css = css.replace(new RegExp('\\' + pair[0], 'g'), '.' + pair[1]);
			});
			return yield fs.writeFileAsync(hacssh.config.dest + cssFile, css);
		}));
	}),
	parseHtml: Promise.method(function () {

		return Promise.map(hacssh.config.html, co.wrap(function* (htmlFile) {

			var html = yield fs.readFileAsync(hacssh.config.cwd + htmlFile, 'utf8');
			_.each(hacssh.sorted, function (pair) {

				var str = HTML_TAG_REGEX[0] + pair[0].slice(1) + HTML_TAG_REGEX[1];
				html = html.replace(new RegExp(str, 'g'), '$1' + pair[1] + '$3');
			});
			return yield fs.writeFileAsync(hacssh.config.dest + htmlFile, html);
		}));
	}),
	parseJs: function () {

	},
	run: co.wrap(function* (config) {

		hacssh.setConfig(config);
		yield hacssh.loadCss();
		yield hacssh.parseCss();
		yield hacssh.parseHtml();
	})
};

module.exports = hacssh;

if (!module.parent) {
	
	var argv = minimist(process.argv.slice(2));

	var config = {
		cwd: argv.cwd || './',
		dest: argv.dest || 'dist/',
		prefix: argv.prefix || 'haccsv',
		index: argv.index || 'aaaaa',
		css: argv.css ? argv.css.split(',') : [],
		html: argv.html ? argv.html.split(',') : [],
		js: argv.js ? argv.js.split(',') : [],
	};
	
	hacssh.run(config);
}
