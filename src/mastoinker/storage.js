
(function () { 'use strict';	

function AppStorage(sectionKey) {
	this.sectionKey = sectionKey;
	this.section = null;
}

AppStorage.prototype.load = function (callback) {
	var instance = this;
	chrome.storage.local.get(this.sectionKey, function (data) {
		var section = data[instance.sectionKey] || {};
		instance.section = section;
		callback(instance);
	});
};

AppStorage.prototype.get = function (key) {
	var value = this.section[key];
	console.log('get', key, value);
	return value;
};

AppStorage.prototype.put = function (key, value, callback) {
	console.log('put', key, value);
	
	this.section[key] = value;
	var dict = {};
	dict[this.sectionKey] = this.section;
	chrome.storage.local.set(dict, function () { 
		/* TODO: handle chrome.runtime.error */
		if (callback) callback();
	});
};

this.AppStorage = AppStorage;

}).call(this);
