
(function () { 'use strict';	

function TimelineItem(node) {
  this.node = node; // preserve reference
  this.id = null;
  this.name = null;
  this.nameElement = null;
  this.displayNameHTML = null;
  this.displayNameText = null;
  this.imageAnchors = null;
  this.hasMediaSpoiler = null;
  this.datetime = null;
	this.boostButton = null;
	this.favouriteButton = null;
  this.boosted = false;
  this.onHomeColumn = false;
  this.onUserColumn = false;
  this.link = null;
  this.numid = null;
}

function TimelineObserver(element, context) {
  this.element = element;
  this.context = context;
  this.observer = null;
  this.sink = null;
  this.removedSink = null;
}

TimelineObserver.prototype.start = function () {
  var instance = this;
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type !== 'childList') return;
      var nodes = mutation.addedNodes;
      nodes.forEach(function (item) {
        if (!item) return;
        instance.handle(item);
      });

      var nodes = mutation.removedNodes;
      nodes.forEach(function (item) {
        if (!item) return;
        instance.handleRemoval(item);
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
  // filter click and listing
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
 
  var statusLink = node.querySelector('a.status__relative-time');
  var boostButton = node.querySelector('button[title="Boost"]');
  var favouriteButton = node.querySelector('button[title="Favourite"]');
  
  var pathname = statusLink.pathname;

  var item = new TimelineItem(node);
  item.name = name;
  item.nameElement = nameElem;
  item.displayNameHTML = displayNameHTML;
  item.displayNameText = displayNameText;
  item.imageAnchors = imageAnchors;
  item.hasMediaSpoiler = mediaSpoiler != null;
  item.datetime = datetime;
	item.boostButton = boostButton;
	item.favouriteButton = favouriteButton;
  item.id = pathname;
  item.numid = pathname.substr(pathname.lastIndexOf('/') + 1);
  item.link = statusLink.href;
  
  if (node.previousSibling) {
    var sibling = node.previousSibling;
    var boosted = sibling.classList.contains('status__prepend');
    item.boosted = boosted;
  }
  
  function searchColumnThatContainsNode(node) {
    var node = node.parentNode;
    var body = document.body;
    while (node != null) {
      if (node === body) return null;
      if (node.classList && node.classList.contains('column')) return node;
      node = node.parentNode;
    }
    return null;
  }
  
  var column = searchColumnThatContainsNode(node);
  if (column) {
    item.onHomeColumn = column.getAttribute('aria-label') === 'Home';
    item.onUserColumn = column.querySelector('.scrollable > div > div > .account__header') != null;
  }
  
  // filtering
  if (!this.context.getConfig('listboost', true) && item.boosted) return;
  if (!this.context.getConfig('listhome', true) && item.onHomeColumn) return;
  if (!this.context.getConfig('listuser', true) && item.onUserColumn) return;

  if (this.sink !== null) {
    this.sink(item);
  }
};


TimelineObserver.prototype.handleRemoval = function (node) {
  if (node.classList && node.classList.contains('status')) {
    this.handleStatusRemoval(node);
  }
  else if (node.children) {
    for (var child of node.children) {
      /* search boosted status recursively */
      this.handleRemoval(child);
    }
  }
};

TimelineObserver.prototype.handleStatusRemoval = function (node) {
  var statusLink = node.querySelector('a.status__relative-time');
  if (statusLink == null) return;
  
  var id = statusLink.pathname;
  if (this.removedSink !== null) {
    this.removedSink(id);
  }
};


this.TimelineObserver = TimelineObserver;

}).call(this);
