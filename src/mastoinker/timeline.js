
(function () { 'use strict';	

function TimelineItem(name, nameElem, displayNameHTML, displayNameText, imageAnchors, hasMediaSpoiler) {
	this.name = name;
	this.nameElement = nameElem;
	this.displayNameHTML = displayNameHTML;
	this.displayNameText = displayNameText;
	this.imageAnchors = imageAnchors;
	this.hasMediaSpoiler = hasMediaSpoiler;
}

function TimelineObserver(element, callback, context) {
	this.element = element;
	this.context = context;
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
	if (mediaSpoiler && !this.context.getConfig('nsfw', true)) return;
	
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
	var item = new TimelineItem(name, nameElem, displayNameHTML, displayNameText, imageAnchors, mediaSpoiler != null);
	if (this.callback) {
		this.callback.call(null, item);
	}
};

this.TimelineObserver = TimelineObserver;

}).call(this);
