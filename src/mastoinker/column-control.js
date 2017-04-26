
(function () { 'use strict';	

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
  var shouldListBoost = context.getConfig('listboost', true);
  var shouldListHome = context.getConfig('listhome', true);
  var shouldListUser = context.getConfig('listuser', true);
  var shouldPreserve = context.getConfig('preserve', true);
  
  var nsfw = new ControlItem('nsfw', chrome.i18n.getMessage('settingNSFW'), shouldDisplayNSFW);
  nsfw.delegate = new ItemDelegate();
  
  var boost = new ControlItem('listboost', chrome.i18n.getMessage('settingListBoost'), shouldListBoost);
  boost.delegate = new ItemDelegate();
  
  var home = new ControlItem('listhome', chrome.i18n.getMessage('settingListHome'), shouldListHome);
  home.delegate = new ItemDelegate();
  
  var user = new ControlItem('listuser', chrome.i18n.getMessage('settingListUser'), shouldListUser);
  user.delegate = new ItemDelegate();

  var preserve = new ControlItem('preserve', chrome.i18n.getMessage('settingPreserve'), shouldPreserve);
  preserve.delegate = new ItemDelegate();

  this.items = [nsfw, boost, home, user, preserve];
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
  
  for (var item of this.items) {
    this.insert(item, settingsOuter);
  }

  var descSettingPreserve = document.createElement('div');
  descSettingPreserve.innerText = chrome.i18n.getMessage('descSettingPreserve');
  descSettingPreserve.style.margin = '8px';
  descSettingPreserve.style.color = '#9baec8';
  settingsOuter.appendChild(descSettingPreserve);

  
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

this.ImageViewColumnControl = ImageViewColumnControl;

}).call(this);
