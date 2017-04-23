
(function () { 'use strict';  

if (!Mastoinker.underlyingMastodon()) return;

var ctx = new AppContext();
ctx.initialize(function (ctx) {
	var oinker = new Mastoinker(ctx);
	oinker.init();
});

}).call(this);

// TODO: avoid namespace pollution
