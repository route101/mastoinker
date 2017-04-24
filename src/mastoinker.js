
(function () { 'use strict';	

function Mastoinker(context) {
  this.context = context;
  this.timelineObserver = null;
  this.imageViewColumn = null;
  this.cssRuleInjector = null;
  this.loadDispatcher = null;
}

Mastoinker.prototype.init = function () {
  var instance = this;
  var columnsArea = document.querySelector('.columns-area');
  if (columnsArea == null) return;

  var imageView = new ImageViewColumn(columnsArea, this.context);

  var dispatcher = new LoadDispatcher()
  dispatcher.sink = imageView.insert.bind(imageView);

  this.timelineObserver = new TimelineObserver(columnsArea, this.context);
  this.timelineObserver.sink = dispatcher.dispatch.bind(dispatcher);
  this.timelineObserver.start();

  this.imageViewColumn = imageView;
  this.imageViewColumn.inject();

  this.cssRuleInjector = new CssRuleInjector();
  this.cssRuleInjector.injectColumnCollapseRule();

  this.loadDispatcher = dispatcher;

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
