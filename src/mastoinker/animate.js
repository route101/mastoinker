
(function () { 'use strict';	

function AnimationTimeline() {
  this.current = null;
}

AnimationTimeline.prototype.add = function (sequence) {
  if (this.current !== null) return;
  sequence.start(this);
  this.current = sequence;
};

AnimationTimeline.prototype.proceed = function () {
  this.current = null;
};

function AnimationSequence(duration) {
  this.timestamp = null;
  this.delegate = null;
  this.elapsed = 0;
  this.duration = duration;
  this.progress = 0;
  this.timeline = null;
  this.linearCurve = function (x) { return x; };
  this.easingOutCurve = function (x) { return x * x * x; };
}

AnimationSequence.prototype.calculateEasingLinear = function (begin, end) {
  return this.calculate(begin, end, this.linearCurve);
};

AnimationSequence.prototype.calculateEasingOut = function (begin, end) {
  return this.calculate(begin, end, this.easingOutCurve);
};

AnimationSequence.prototype.calculate = function (begin, end, curve) {
  var variable = (end - begin) * curve(this.progress);
  return begin + variable;
};

AnimationSequence.prototype.start = function (timeline) {
  this.timeline = timeline;
  requestAnimationFrame(this.step.bind(this));
};

AnimationSequence.prototype.step = function (timestamp) {
  if (this.timestamp === null) {
    /* initial step */
    this.timestamp = timestamp;
    if (this.delegate !== null) {
      this.delegate.updated(this, this.progress, delta);
    }
    requestAnimationFrame(this.step.bind(this));
    return;
  }

  var delta = timestamp - this.timestamp;
  this.elapsed += delta;
  this.progress = this.elapsed / this.duration;
  if (this.elapsed >= this.duration) {
    /* final step */
    this.progress = 1.0;
    if (this.delegate !== null) {
      this.delegate.updated(this, this.progress, delta);
    }
    this.timeline.proceed();
    this.timeline = null;
    return;
  }

  if (this.delegate !== null) {
    this.delegate.updated(this, this.progress, delta);
  }

  this.timestamp = timestamp;
  requestAnimationFrame(this.step.bind(this));
};

this.AnimationSequence = AnimationSequence;
this.AnimationTimeline = AnimationTimeline;

}).call(this);
