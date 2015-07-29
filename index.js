var through = require('through2')
	, Freemarker = require('freemarker.js')
	, PluginError = require('gulp-util').PluginError

module.exports = function(options) {

	if (!options)
		throw new PluginError('gulp-freemarker', 'no options supplied')
	if (!options.viewRoot)
		throw new PluginError('gulp-freemarker', 'viewRoot options is necessary!')

	var engine = new Freemarker(options)

	return through.obj(function(file, encoding, cb) {
		if (file.isNull()) {
			this.push(file)
			return cb()
		}
		if (file.isStream()) {
			var toString = ''
			file.contents.on('data', function(chunk) {
				toString += chunk
			})
			file.contents.on('end', function() {
				var configuration = JSON.parse(toString)
				engine.render(configuration.tpl, configuration.data, function(err, out, msg) {
					if (err) return cb(err)
					var stream = through()
					stream.on('error', this.emit.bind(this, 'error'))
					stream.write(out || msg)
					file.contents = stream
					stream.end()
					this.push(file)
					cb()
				}.bind(this))
			}.bind(this))
			file.contents.on('error', function(err) {
				this.emit('error', new PluginError('gulp-freemarker', 'Read stream error!'))
			}.bind(this))
		}
		if (file.isBuffer()) {
			var configuration = JSON.parse(file.contents)
			engine.render(configuration.tpl, configuration.data, function(err, out, msg) {
				if (err) return cb(err)
				file.contents = new Buffer(out || msg)
				file.path = file.path.replace('.json', '.html') // fixme: feels a bit hacky
				this.push(file)
				cb()
			}.bind(this))
		}
	})
}
