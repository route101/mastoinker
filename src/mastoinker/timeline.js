
(function () { 'use strict';	

function TimelineItem(node) {
	this.node = node; // preserve reference
	this.name = null;
	this.nameElement = null;
	this.displayNameHTML = null;
	this.displayNameText = null;
	this.imageAnchors = null;
	this.hasMediaSpoiler = null;
	this.datetime = null;
}

function TimelineObserver(element, context) {
	this.element = element;
	this.context = context;
	this.observer = null;
	this.sink = null;
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

	var datetime = null;
	var timeElem = node.querySelector('time');
	if (timeElem) {
		var datetimeStr = timeElem.getAttribute('datetime');
		if (datetimeStr && datetimeStr != "") {
			datetime = Date.parse(datetimeStr);
		}
	}
	
	var imageAnchors = [];
	var anchors = node.querySelectorAll('a');
	anchors.forEach(function (item) {
		if (item.style.background && item.style.background !== "") {
			imageAnchors.push(item);
		}
	});
	
	var item = new TimelineItem(node);
	item.name = name;
	item.nameElement = nameElem;
	item.displayNameHTML = displayNameHTML;
	item.displayNameText = displayNameText;
	item.imageAnchors = imageAnchors;
	item.hasMediaSpoiler = mediaSpoiler != null;
	item.datetime = datetime;

	if (this.sink !== null) {
		this.sink(item);
	}
};

this.TimelineObserver = TimelineObserver;

}).call(this);
