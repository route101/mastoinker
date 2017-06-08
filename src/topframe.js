
(function () { 'use strict';  

function underlyingMastodon() {
  var reactAppHolder = document.querySelector('body.app-body > .app-holder');
  if (reactAppHolder == null) return false;
  return (reactAppHolder.dataset.reactClass === 'Mastodon' || reactAppHolder.id === 'mastodon');
}

if (!underlyingMastodon()) return;


var ctx = new AppContext();
ctx.initialize(function (ctx) {
  var oinker = new Mastoinker(ctx);
  oinker.init();
});


}).call(this);

