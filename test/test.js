'use strict';
/* jshint undef: true, unused: true, node: true */
/* global before, describe, it */

// vendor dependencies
global.Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var co = require('co');
var _ = require('underscore');
var assert = require('assert');

var hacssh = require('../index.js');

var FIXTURES = 'test/fixtures/';
var TEST_DIR = 'test/.tmp/';

before(function (done) {
   
    co(function* () {

        yield fs.mkdirAsync(TEST_DIR);
        done();
    }).catch(done);
});

after(function (done) {

    co(function* () {

        yield fs.unlinkAsync(TEST_DIR + 'ui.css');
        yield fs.unlinkAsync(TEST_DIR + 'bootstrap.css');
        yield fs.unlinkAsync(TEST_DIR + 'modal.html');
        yield fs.rmdirAsync(TEST_DIR);
        done();
    }).catch(done);
});

describe('hacssh', function () {

    it('#setConfig', function (done) {

        hacssh.setConfig({
            cwd: FIXTURES,
            dest: TEST_DIR,
            css: ['bootstrap.css', 'ui.css'],
            html: ['modal.html'],
        });

        assert.equal(hacssh.config.prefix, 'hacssh');
        assert.equal(hacssh.config.index, 'aaaaa');
        assert.equal(hacssh.config.cwd, FIXTURES);
        assert.equal(hacssh.config.dest, TEST_DIR);
        assert.equal(hacssh.config.css.length, 2);
        assert.equal(hacssh.config.html.length, 1);
        assert.equal(hacssh.config.js.length, 0);
        done();
    });

    it('#_set', function (done) {

        hacssh._set('.modal');
        hacssh._set('.modal-dialog');
        hacssh._set('.modal-body');
        hacssh._set('.col-md-8');

        var hash = hacssh.hash;
        assert.equal(hash['.modal'], 'hacssh-aaaaa');
        assert.equal(hash['.modal-dialog'], 'hacssh-aaaab');
        assert.equal(hash['.modal-body'], 'hacssh-aaaac');
        assert.equal(hash['.col-md-8'], 'hacssh-aaaad');
        done();
    });

    it('#_sort', function (done) {

        var sorted = hacssh._sort();
        assert.equal(sorted, hacssh.sorted);
        assert.equal(sorted.length, 4);
        assert.equal(sorted[0][0], '.modal-dialog');
        assert.equal(sorted[1][0], '.modal-body');
        assert.equal(sorted[2][0], '.col-md-8');
        assert.equal(sorted[3][0], '.modal');
        done();
    });

    it('#loadCss', function (done) {

        co(function* () {

            var sorted = yield hacssh.loadCss();
            var keys = _.keys(hacssh.hash);
            assert.equal(keys.length, sorted.length);
            done();
        }).catch(done);
    });

    it('#parseCss', function (done) {
        
        co(function* () {

            yield hacssh.parseCss();
            var css = yield fs.readFileAsync(TEST_DIR + 'ui.css', 'utf8');
            assert.equal(css.indexOf('modal-dialog'), -1);
            assert.notEqual(css.indexOf('hacssh-aaaab'), -1);
            assert.equal(css.indexOf('modal-body'), -1);
            assert.notEqual(css.indexOf('hacssh-aaaac'), -1);
            assert.equal(css.indexOf('modal-modal'), -1);
            assert.notEqual(css.indexOf('hacssh-aaaaa'), -1);
            done();
        }).catch(done);
    });

    it('#parseHtml', function (done) {
        
        co(function* () {

            yield hacssh.parseHtml();
            var html = yield fs.readFileAsync(TEST_DIR + 'modal.html', 'utf8');
            assert.equal(html.indexOf('modal-dialog'), -1);
            assert.notEqual(html.indexOf('hacssh-aaaab'), -1);
            assert.equal(html.indexOf('modal-body'), -1);
            assert.notEqual(html.indexOf('hacssh-aaaac'), -1);
            assert.equal(html.indexOf('modal-modal'), -1);
            assert.notEqual(html.indexOf('hacssh-aaaaa'), -1);
            done();
        }).catch(done);
    });
});