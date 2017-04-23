
(function () { 'use strict';	


function CssRuleInjector() {

}

CssRuleInjector.prototype.inject = function (selector, rule) {
	if (document.styleSheets == null) return;
	if (document.head == null) return;
	var style = document.createElement('style');
	style.appendChild(document.createTextNode(''));
	document.head.appendChild(style);
	style.sheet.insertRule(selector + ' {' + rule + '}', style.sheet.cssRules.length);
};

CssRuleInjector.prototype.injectColumnCollapseRule = function () {
	this.inject('.columns-area > div:nth-child(2):nth-last-child(1)', 'display: none !important;');
}


this.CssRuleInjector = CssRuleInjector;

}).call(this);
