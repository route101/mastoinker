
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
AppContext.prototype.getConfig = function (key) {
	return this.configStorage.get(key);
};

AppContext.prototype.putConfig = function (key, value) {
	this.configStorage.put(key, value);
};

this.AppContext = AppContext;

}).call(this);
