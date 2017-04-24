
(function () { 'use strict';	

function ImageViewColumnHeader(container) {
  this.container = container;
  this.delegate = null;
}

ImageViewColumnHeader.prototype.inject = function () {
  var instance = this;
  var header = document.createElement('div');
  header.classList.add('column-header');
  header.role = 'button';
  header.onclick = function () {
    var delegate = instance.delegate;
    if (delegate === null) return;
    delegate.clicked(instance, this);
  };

  var headerIcon = document.createElement('i');
  headerIcon.classList.add('fa', 'fa-fw', 'fa-heart');
  headerIcon.style = 'display: inline-block; margin-right: 5px;';
  header.appendChild(headerIcon);

  var headerText = document.createElement('span');
  headerText.innerText = 'Oinker';
  header.appendChild(headerText);

  this.container.appendChild(header);
}

function ControlItem(id, name, value) {
  this.id = id;
  this.name = name;
  this.value = value;
  this.delegate = null;
}

ControlItem.prototype.changeValue = function(value) {
  if (this.delegate !== null) {
    this.delegate.changed(this, value);
  }
  this.value = value;
};

function ImageViewColumnControl(container, context) {
  this.container = container;

  function ItemDelegate() { }
  ItemDelegate.prototype.changed = function (item, value) {
    context.putConfig(item.id, value, function () {
      // HAX: NO MODAL PLZ
      var confirmed = window.confirm('[MastOinker] Refresh the page to apply changes. \nAre you sure you want to reload the current page?');
      if (confirmed) {
        window.location.reload();
      }
    });
  };

  // defaults true
  var shouldDisplayNSFW = context.getConfig('nsfw', true);

  this.nsfwControlItem = new ControlItem('nsfw', "Display NSFW images", shouldDisplayNSFW);
  this.nsfwControlItem.delegate = new ItemDelegate();

  this.items = [this.nsfwControlItem];
}

ImageViewColumnControl.prototype.inject = function () {
  var control = document.createElement('div');
  control.style.position = 'relative';

  var settingsButton = document.createElement('div');
  settingsButton.classList.add('column-icon',  'collapsable-collapsed')
  settingsButton.style = 'font-size: 16px; padding: 15px; position: absolute; right: 0px; top: -48px; cursor: pointer; z-index: 3;';
  control.appendChild(settingsButton);

  var settingsButtonIcon = document.createElement('i');
  settingsButtonIcon.classList.add('fa', 'fa-sliders');
  settingsButton.appendChild(settingsButtonIcon);

  var settingsOverlay = document.createElement('div');
  settingsOverlay.style = 'overflow: hidden; height: 0px; opacity: 0; max-height: 70vh;';
  control.appendChild(settingsOverlay);

  var settingsOuter = document.createElement('div');
  settingsOuter.classList.add('column-settings--outer');
  settingsOuter.style = 'padding: 15px;';
  settingsOverlay.appendChild(settingsOuter);

  this.insert(this.nsfwControlItem, settingsOuter);

  settingsButton.onclick = function () {
    if (settingsButton.classList.contains('collapsable-collapsed')) {
      settingsButton.classList.remove('collapsable-collapsed');
      settingsButton.classList.add('collapsable');
      settingsOverlay.style.height = settingsOuter.clientHeight + 'px';
      settingsOverlay.style.opacity = '1';
    }
    else {
      settingsButton.classList.remove('collapsable');
      settingsButton.classList.add('collapsable-collapsed');
      settingsOverlay.style.height = '0px';
      settingsOverlay.style.opacity = '0';
    }
  };

  this.container.appendChild(control);
};

ImageViewColumnControl.prototype.insert = function (item, container) {
  var settingsSection = document.createElement('div');

  var label = document.createElement('label');
  label.style = 'display: block; line-height: 24px; vertical-align: middle;';
  settingsSection.appendChild(label);

  var toggleContainer = document.createElement('div');
  toggleContainer.classList.add('react-toggle');
  if (item.value) {
    toggleContainer.classList.add('react-toggle--checked');
  }
  label.appendChild(toggleContainer);

  var toggleLabel = document.createElement('span');
  toggleLabel.classList.add('setting-toggle');
  toggleLabel.style = 'display: inline-block; vertical-align: middle; margin-bottom: 14px; margin-left: 8px;';
  toggleLabel.innerText = item.name;
  label.appendChild(toggleLabel);

  var toggleTrack = document.createElement('div');
  toggleTrack.classList.add('react-toggle-track');
  toggleContainer.appendChild(toggleTrack);

  var toggleThumb = document.createElement('div');
  toggleThumb.classList.add('react-toggle-thumb');
  toggleContainer.appendChild(toggleThumb);

  var toggleInput = document.createElement('input');
  toggleInput.classList.add('react-toggle-screenreader-only');
  toggleInput.type = 'checkbox';
  toggleInput.value = item.value ? 'on' : '';
  toggleInput.onchange = function () {
    if (this.value === 'on') {
      this.value = '';
      toggleContainer.classList.remove('react-toggle--checked');
    }
    else {
      toggleContainer.classList.add('react-toggle--checked');
      this.value = 'on';
    }
    item.changeValue(this.value === 'on');
  };
  toggleContainer.appendChild(toggleInput);	

  container.appendChild(settingsSection);
};


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

	boostButton.appendChild(boostButtonIcon);
	favButton.appendChild(favButtonIcon);
	boostButtonDiv.appendChild(boostButton);
	favButtonDiv.appendChild(favButton);
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

this.ImageViewColumn = ImageViewColumn;

}).call(this);
