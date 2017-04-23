
(function () { 'use strict';	

function Mastoinker(context) {
	this.context = context;
	this.timelineObserver = null;
	this.imageViewColumn = null;
	this.cssRuleInjector = null;
}

Mastoinker.prototype.init = function () {
	var instance = this;
	var columnsArea = document.querySelector('.columns-area');
	if (columnsArea == null) return;
	
	var imageView = new ImageViewColumn(columnsArea, this.context);
	this.timelineObserver = new TimelineObserver(columnsArea, imageView.insert.bind(imageView), this.context);
	this.timelineObserver.start();
	
	this.imageViewColumn = imageView;
	this.imageViewColumn.inject();
	
	this.cssRuleInjector = new CssRuleInjector();
	this.cssRuleInjector.injectColumnCollapseRule();
	
	// HAX: ideal design: observer->processor
	this.timelineObserver.handle(document.body);
};

Mastoinker.prototype.deinit = function () {
	if (this.timelineObserver !== null) {
		this.timelineObserver.stop();
		this.timelineObserver = null;
	}
};

Mastoinker.underlyingMastodon = function () {
	var reactAppHolder = document.querySelector('body.app-body > .app-holder');
	if (reactAppHolder == null) return false;
	return reactAppHolder.dataset.reactClass === 'Mastodon';
};

this.Mastoinker = Mastoinker;

}).call(this);
