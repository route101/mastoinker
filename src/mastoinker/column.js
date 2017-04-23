
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
		context.putConfig(item.id, value);
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
	
	/* // displaying svgs is a bit overkill
	var toggleTrackCheck = document.createElement('div');
	toggleTrackCheck.classList.add('react-toggle-track-check');
	
	var svgCheck = document.createElement('svg');
	svgCheck.width = '14';
	svgCheck.height = '11';
	svgCheck.viewBox = '0 0 14 11';
	var svgCheckTitle = document.createElement('title');
	svgCheckTitle.innerText = 'switch-check';
	svgCheck.appendChild(svgCheckTitle);
	
	var svgCheckPath = document.createElement('path');
	svgCheckPath.setAttribute('d', 'M11.264 0L5.26 6.004 2.103 2.847 0 4.95l5.26 5.26 8.108-8.107L11.264 0');
	svgCheckPath.setAttribute('fill', '#fff');
	svgCheckPath.setAttribute('fill-rule', 'evenodd');
	svgCheck.appendChild(svgCheckPath);
	svgCheck.appendChild(svgCheckPath);
	toggleTrackCheck.appendChild(svgCheck);
	toggleTrack.appendChild(toggleTrackCheck);
	
	var toggleTrackX = document.createElement('div');
	toggleTrackX.classList.add('react-toggle-track-x');
	var svgX = document.createElement('svg');
	svgX.width = '10';
	svgX.height = '10';
	svgX.viewBox = '0 0 10 10';
	var svgXTitle = document.createElement('title');
	svgXTitle.innerText = 'switch-x';
	svgCheck.appendChild(svgXTitle);
	
	var svgXPath = document.createElement('path');
	svgXPath.setAttribute('d', 'M9.9 2.12L7.78 0 4.95 2.828 2.12 0 0 2.12l2.83 2.83L0 7.776 2.123 9.9 4.95 7.07 7.78 9.9 9.9 7.776 7.072 4.95 9.9 2.12');
	svgXPath.setAttribute('fill', '#fff');
	svgXPath.setAttribute('fill-rule', 'evenodd');
	svgX.appendChild(svgXPath);
	svgX.appendChild(svgXPath);
	toggleTrackX.appendChild(svgX);
	toggleTrack.appendChild(toggleTrackX);
	*/
	
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

ImageViewColumn.prototype.insert = function (timelineItem) {
	var instance = this;
	var content = instance.content.element;
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

this.ImageViewColumn = ImageViewColumn;

}).call(this);
