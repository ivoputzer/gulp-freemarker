'use strict';

var fs = require('fs')
	, es = require('event-stream')
	, should = require('should')
	, path = require('path')

require('mocha')

delete require.cache[require.resolve('../')]

var gutil = require('gulp-util')
	, freemarker = require('../')

describe('gulp-freemarker', function () {

	var expectedFile = new gutil.File({
		path: path.join(__dirname, 'expected/hello.txt'),
		cwd: __dirname,
		base: path.join(__dirname, 'expected'),
		contents: fs.readFileSync(path.join(__dirname, 'expected/hello.txt'))
	})

	it('should produce expected file via buffer', function (done) {

		var srcFile = new gutil.File({
			path: path.join(__dirname, 'fixtures/hello.json'),
			cwd: __dirname,
			base: path.join(__dirname, 'fixtures'),
			contents: fs.readFileSync(path.join(__dirname, 'fixtures/hello.json'))
		});

		var stream = freemarker({
			viewRoot: path.join(__dirname, 'fixtures'),
			options: {}
		});

		stream.on('error', function(err) {
			should.exist(err);
			done(err);
		});

		stream.on('data', function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);

			String(newFile.contents).should.equal(String(expectedFile.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});

	it('should error on stream', function (done) {

		var srcFile = new gutil.File({
			path: path.join(__dirname, 'fixtures/hello.json'),
			cwd: __dirname,
			base: path.join(__dirname, 'fixtures'),
			contents: fs.createReadStream(path.join(__dirname, 'fixtures/hello.json'))
		});

		var stream = freemarker({
			viewRoot: path.join(__dirname, 'fixtures'),
			options: {}
		});

		stream.on('error', function(err) {
			should.exist(err);
			done();
		});

		stream.on('data', function (newFile) {
			newFile.contents.pipe(es.wait(function(err, data) {
				done(err);
			}));
		});

		stream.write(srcFile);
		stream.end();
	});

	it('should produce expected file via stream', function (done) {

		var srcFile = new gutil.File({
			path: path.join(__dirname, 'fixtures/hello.json'),
			cwd: __dirname,
			base: path.join(__dirname, 'fixtures'),
			contents: fs.createReadStream(path.join(__dirname, 'fixtures/hello.json'))
		});

		var stream = freemarker({
			viewRoot: path.join(__dirname, 'fixtures'),
			options: {}
		});

		stream.on('error', function(err) {
			should.exist(err);
			done();
		});

		stream.on('data', function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);

			newFile.contents.pipe(es.wait(function(err, data) {
				should.not.exist(err);
				(''+data).should.equal(String(expectedFile.contents));
				done();
			}));
		});

		stream.write(srcFile);
		stream.end();
	});
});
