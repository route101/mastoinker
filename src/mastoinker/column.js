
(function () { 'use strict';	

function ImageViewColumn(container, context) {
  this.container = container;
  this.context = context;
  this.header = null;
  this.control = null;
  this.content = null;
}

ImageViewColumn.prototype.inject = function () {
  var column = document.createElement('div');
  column.role = 'section';
  column.classList.add('column');

  var header = new ImageViewColumnHeader(column);
  var control = new ImageViewColumnControl(column, this.context);
  var content = new ImageViewColumnContent(column);

  header.inject();
  control.inject();
  content.inject();

  function HeaderDelegate() { }
  HeaderDelegate.prototype.clicked = function () {
    content.scrollTop();
  };
  header.delegate = new HeaderDelegate();

  function ControlDelegate() { }
  ControlDelegate.prototype.changed = function (item, state) {

  };
  control.delegate = new ControlDelegate();

  this.header = header;
  this.control = control;
  this.content = content;
  this.container.appendChild(column);
};

ImageViewColumn.prototype.insert = function (/* LoadProxy */ proxy) {
  var instance = this;
  var content = instance.content.element;

  var timelineItem = proxy.item;
  if (timelineItem.imageAnchors.length === 0) return;

  var itemContainer = document.createElement('div');
	var header = document.createElement('div');
	header.style.marginLeft = '5px';
	header.style.display = 'flex';
	header.style.flexDirection = 'row';
	header.style.alignItems = 'center';
	header.style.justifyContent = 'space-between';
	
	var title = document.createElement('div');
  title.innerHTML = timelineItem.displayNameHTML;
  title.style = 'max-width: 70%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13.5px;';
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
  header.appendChild(title);
	
	// toobar
	var toolbar = document.createElement('div');
	toolbar.style = 'margin-top: 1px; margin-bottom: 1px; overflow: visible;';
	
	var favButtonDiv = document.createElement('div');
	favButtonDiv.style = 'display: inline-block; margin-right: 3px;';
	
	var boostButtonDiv = document.createElement('div');
	boostButtonDiv.style = 'display: inline-block; margin-right: 18px;';

	var favButton = document.createElement('button');
	favButton.classList.add('icon-button');
	favButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';
	
	var boostButton = document.createElement('button');
	boostButton.classList.add('icon-button');
	boostButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';

	var favButtonIcon = document.createElement('i');
	favButtonIcon.classList.add('fa', 'fa-fw', 'fa-star');
	favButtonIcon.style.verticalAlign = 'middle';

	var boostButtonIcon = document.createElement('i');
	boostButtonIcon.classList.add('fa', 'fa-fw', 'fa-retweet');
	boostButtonIcon.style.verticalAlign = 'middle';

	// used when reference gets lost
	var statusLinkDiv = document.createElement('div');
	statusLinkDiv.style = 'display: inline-block; margin-right: 18px;';
	var statusLinkButton = document.createElement('button');
	statusLinkButton.classList.add('icon-button');
	statusLinkButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';
	var statusLinkButtonIcon = document.createElement('i');
	statusLinkButtonIcon.classList.add('fa', 'fa-fw', 'fa-mail-forward');
	statusLinkButtonIcon.style.verticalAlign = 'middle';


	boostButton.appendChild(boostButtonIcon);
	favButton.appendChild(favButtonIcon);
	statusLinkButton.appendChild(statusLinkButtonIcon);
	boostButtonDiv.appendChild(boostButton);
	favButtonDiv.appendChild(favButton);
	statusLinkDiv.appendChild(statusLinkButton);
	
	toolbar.appendChild(boostButtonDiv);
	toolbar.appendChild(favButtonDiv);
	
	header.appendChild(toolbar);
	itemContainer.appendChild(header);

	boostButton.onclick = function () {
		var button = timelineItem.boostButton;
		if (button) {
			button.click();
		}
	};
	favButton.onclick = function () {
		var button = timelineItem.favouriteButton;
		if (button) {
			button.click();
		}
	};
	statusLinkButton.onclick = function () {
		var link = timelineItem.link;
		if (link) {
			window.open(link);
		}
	};
	
	function updateButton(active, star) {
		if (active) {
			this.classList.add('active');
			if (star) this.style.color = 'rgb(202, 143, 4)';
		}
		else {
			this.classList.remove('active');
			if (star) this.style.removeProperty('color');
		}
	}
	
	function observe(target, button, star) {
		function callback(mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type !== 'attributes') return;
				var active = target.classList.contains('active');
				updateButton.call(button, active, star);
			});
		}
		var observer = new MutationObserver(callback);
		observer.observe(target, { attributes: true });
		return observer;
	}

	if (timelineItem.boostButton) {
		updateButton.call(boostButton, 
			timelineItem.boostButton.classList.contains('active'), false);
		var ob = observe(timelineItem.boostButton, boostButton, false);
		itemContainer.$oinker$boost$observer = ob; // HAX
	}

	if (timelineItem.favouriteButton) {
		updateButton.call(favButton, 
			timelineItem.favouriteButton.classList.contains('active'), true);
		var ob = observe(timelineItem.favouriteButton, favButton, true);
		itemContainer.$oinker$fav$observer = ob; // HAX
	}

	// images
  var loader = new ImageLazyLoader();

  timelineItem.imageAnchors.forEach(function (imageAnchor) {
    var image = document.createElement('img');
    image.style.width = '100%';
    image.style.cursor = 'pointer';
    image.onclick = function () {
      imageAnchor.click();
    };

    loader.register(image, imageAnchor.href);
    itemContainer.appendChild(image);
  });

  proxy.sink = function (completionHandler) {
    loader.sink = completionHandler;
    loader.start();
  };
	
	itemContainer.dataset.statusId = timelineItem.id;
	itemContainer.$referenceLost = function () {
		toolbar.removeChild(boostButtonDiv);
		toolbar.removeChild(favButtonDiv);
		toolbar.appendChild(statusLinkDiv);
	};
	
  content.insertBefore(itemContainer, content.firstChild);
  var ROTATION = 100;
  if (content.children.length > ROTATION) {
    var last = content.lastChild;
		
		if (last.$oinker$boost$observer) {
			last.$oinker$boost$observer.disconnect();
		}
		if (last.$oinker$fav$observer) {
			last.$oinker$fav$observer.disconnect();
		}
		
    content.removeChild(last);
  }
};

ImageViewColumn.prototype.remove = function (id) {
	var found = [];
	var content = this.content.element;
	for (var element of content.children) {
		if (element.dataset.statusId === id) {
			found.push(element);
		}
	}

	for (var element of found) {
		if (element.$oinker$boost$observer) {
			element.$oinker$boost$observer.disconnect();
			element.$oinker$boost$observer = null;
		}
		if (element.$oinker$fav$observer) {
			element.$oinker$fav$observer.disconnect();
			element.$oinker$fav$observer = null;
		}
		if (element.$referenceLost) {
			element.$referenceLost.call(null);
			element.$referenceLost = null;
		}
	}
	
	if (this.context.getConfig('preserve', true)) {
		return;
	} 
	
	for (var element of found) {
		content.removeChild(element);
	}
};

this.ImageViewColumn = ImageViewColumn;

}).call(this);
