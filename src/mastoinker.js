
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


function TimelineItem(name, nameElem, displayNameHTML, displayNameText, imageAnchors) {
	this.name = name;
	this.nameElement = nameElem;
	this.displayNameHTML = displayNameHTML;
	this.displayNameText = displayNameText;
	this.imageAnchors = imageAnchors;
}

function TimelineObserver(element, callback) {
	this.element = element;
	this.observer = null;
	this.callback = callback;
}

TimelineObserver.prototype.start = function () {
	var instance = this;
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type !== 'childList') return;
			var nodes = mutation.addedNodes;
			if (nodes.length === 0) return;
			nodes.forEach(function (item) {
				if (!item) return;
				instance.handle(item);
			});
		});
	});
	var config = { attributes: true, childList: true, characterData: true, subtree: true };
	observer.observe(this.element, config);
	this.observer = observer;
};

TimelineObserver.prototype.stop = function () {
	if (this.observer === null) return;
	this.observer.stop();
	this.observer = null;
};

TimelineObserver.prototype.handle = function (node) {
	if (node.classList && node.classList.contains('status')) {
		this.handleStatus(node);
	}
	else if (node.children) {
		for (var child of node.children) {
			/* search boosted status recursively */
			this.handle(child);
		}
	}
};

TimelineObserver.prototype.handleStatus = function (node) {
	var name = ""
	var displayNameHTML = ""
	var displayNameText = ""
	var nameElem = node.querySelector('.status__display-name');
	if (nameElem) {
		name = nameElem.pathname.substring(1); /* trim `/` */
	}
	var displayNameElem = node.querySelector('.display-name');
	if (displayNameElem) {
		displayNameHTML = displayNameElem.innerHTML;
		displayNameText = displayNameElem.innerText;
	}
	var mediaSpoiler = node.querySelector('.media-spoiler');
	if (mediaSpoiler) {
		mediaSpoiler.click();
	}
	var imageAnchors = [];
	var anchors = node.querySelectorAll('a');
	anchors.forEach(function (item) {
		if (item.style.background && item.style.background !== "") {
			imageAnchors.push(item);
		}
	});
	var item = new TimelineItem(name, nameElem, displayNameHTML, displayNameText, imageAnchors);
	if (this.callback) {
		this.callback.call(null, item);
	}
};

function ImageViewColumn(container) {
	this.container = container;
	this.content = null;
}

ImageViewColumn.prototype.inject = function () {
	var column = document.createElement('div');
	column.role = 'section';
	column.classList.add('column');
	var header = document.createElement('div');
	header.classList.add('column-header');
	header.role = 'button';
	
	var headerIcon = document.createElement('i');
	headerIcon.classList.add('fa', 'fa-fw', 'fa-heart');
	headerIcon.style = 'display: inline-block; margin-right: 5px;';
	header.appendChild(headerIcon);
	
	var headerText = document.createElement('span');
	headerText.innerText = 'Oinker';
	header.appendChild(headerText);
	
	var content = document.createElement('div');
	content.classList.add('scrollable');
	
	column.appendChild(header);
	column.appendChild(content);
	
	this.content = content;
	this.container.appendChild(column);
};

ImageViewColumn.prototype.insert = function (timelineItem) {
	var instance = this;
	var content = instance.content;
	if (timelineItem.imageAnchors.length === 0) return;
	
	var itemContainer = document.createElement('div');
	
	var title = document.createElement('div');
	title.innerHTML = timelineItem.displayNameHTML;
	title.style = 'max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13.5px;';
	title.style.cursor = 'pointer';
	title.onmouseover = function () {
		this.style['text-decoration'] = 'underline';
	};
	title.onmouseout = function () {
		this.style['text-decoration'] = 'none';
	};
	title.onclick = function () {
		var a = timelineItem.nameElement;
		window.open(a.href);
	};
	
	itemContainer.appendChild(title);
	
	timelineItem.imageAnchors.forEach(function (imageAnchor) {
		var image = document.createElement('img');
		image.src = imageAnchor.href;
		image.style.width = '100%';
		image.style.cursor = 'pointer';
		image.onclick = function () {
			imageAnchor.click();
		};
		itemContainer.appendChild(image);
	});
	
	content.insertBefore(itemContainer, content.firstChild);
	var ROTATION = 100;
	if (content.children.length > ROTATION) {
		var last = content.lastChild;
		content.removeChild(last);
	}
};

function Mastoinker() {
	this.timelineObserver = null;
	this.imageViewColumn = null;
	this.cssRuleInjector = null;
}

Mastoinker.prototype.init = function () {
	var instance = this;
	if (!this.confirm()) return;
	
	var columnsArea = document.querySelector('.columns-area');
	if (columnsArea == null) return;
	
	var imageView = new ImageViewColumn(columnsArea);
	this.timelineObserver = new TimelineObserver(columnsArea, imageView.insert.bind(imageView));
	this.timelineObserver.start();
	
	this.imageViewColumn = imageView;
	this.imageViewColumn.inject();
	
	this.cssRuleInjector = new CssRuleInjector();
	this.cssRuleInjector.injectColumnCollapseRule();
};

Mastoinker.prototype.deinit = function () {
	if (this.timelineObserver !== null) {
		this.timelineObserver.stop();
		this.timelineObserver = null;
	}
};

Mastoinker.prototype.confirm = function () {
	var reactAppHolder = document.querySelector('body.app-body > .app-holder');
	if (reactAppHolder == null) return false;
	return reactAppHolder.dataset.reactClass === 'Mastodon';
};

this.Mastoinker = Mastoinker;

}).call(this);
