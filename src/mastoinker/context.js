
(function () { 'use strict';	

function AppContext() {
	this.configStorage = new AppStorage('v1.config');
}

AppContext.prototype.initialize = function (callback) {
	var instance = this;
	this.configStorage.load(function () {
		callback(instance);
	})
};

// TODO: need config-manager thing
AppContext.prototype.getConfig = function (key, defaultValue) {
	var value = this.configStorage.get(key);
	if (value === undefined) value = defaultValue;
	return value;
};

AppContext.prototype.putConfig = function (key, value, callback) {
	this.configStorage.put(key, value, callback);
};

this.AppContext = AppContext;

}).call(this);
