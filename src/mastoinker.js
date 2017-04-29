
(function () { 'use strict';	

function Mastoinker(context) {
  this.context = context;
  this.timelineObserver = null;
  this.imageViewColumn = null;
  this.cssRuleInjector = null;
  this.scriptInjector = null;
  this.loadDispatcher = null;
}

Mastoinker.prototype.init = function () {
  var instance = this;
  var columnsArea = document.querySelector('.columns-area');
  if (columnsArea == null) return;
  
  var columnContainer = columnsArea;
  if (columnContainer == null) return;
  
  var imageView = new ImageViewColumn(columnContainer, this.context);

  var dispatcher = new LoadDispatcher()
  dispatcher.sink = imageView.insert.bind(imageView);
  
  this.timelineObserver = new TimelineObserver(columnsArea, this.context);
  this.timelineObserver.sink = dispatcher.dispatch.bind(dispatcher);
  this.timelineObserver.removedSink = imageView.remove.bind(imageView);
  this.timelineObserver.start();

  this.imageViewColumn = imageView;
  this.imageViewColumn.inject();

  this.cssRuleInjector = new CssRuleInjector();
  this.cssRuleInjector.injectColumnCollapseRule();
  this.cssRuleInjector.injectOinkButtonRule();
  this.cssRuleInjector.injectColumnFixPosition();
  
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

this.Mastoinker = Mastoinker;

}).call(this);
