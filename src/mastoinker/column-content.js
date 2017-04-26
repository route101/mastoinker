
(function () { 'use strict';	

function ImageViewColumnContent(container) {
  this.container = container;
  this.element = null;
  this.animationTimeline = new AnimationTimeline();
}

ImageViewColumnContent.prototype.inject = function () {
  var content = document.createElement('div');
  content.classList.add('scrollable');
  this.element = content;
  this.container.appendChild(content);
};

ImageViewColumnContent.prototype.scrollTop = function () {
  var element = this.element;	
  var initial = element.scrollTop;

  var seq = new AnimationSequence(250);
  function AnimationDelegate() { }
  AnimationDelegate.prototype.updated = function (seq, progress, delta) {
    element.scrollTop = seq.calculateEasingOut(initial, 0);
  };
  seq.delegate = new AnimationDelegate();
  this.animationTimeline.add(seq);
};

this.ImageViewColumnContent = ImageViewColumnContent;

}).call(this);

