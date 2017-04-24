
(function () { 'use strict';	

function ImageLazyLoader() {
	this.count = 0;
	this.images = [];
	this.srcs = [];
	this.sink = null;
	this.timeoutDelay = 5000;
	this.timeoutID = null;
}

ImageLazyLoader.prototype.register = function (image, src) {
	this.images.push(image);
	this.srcs.push(src);
};

ImageLazyLoader.prototype.goNext = function () {
	if (this.timeoutID !== null) {
		clearTimeout(this.timeoutID);
		this.timeoutID = null;
	}

	this.count += 1;
	if (this.count === this.images.length) {
		this.sink();
	}
};

ImageLazyLoader.prototype.timedout = function () {
	this.timeoutID = null;
	this.sink();
};

ImageLazyLoader.prototype.start = function () {
	for (var i = 0; i < this.images.length; i++) {
		var image = this.images[i];
		var src = this.srcs[i];
		image.onload = this.goNext.bind(this);
		image.src = src;
	}
	this.timeoutID = setTimeout(this.timedout.bind(this), this.timeoutDelay);
};

this.ImageLazyLoader = ImageLazyLoader;

}).call(this);

