
(function () { 'use strict';	

function ImageViewColumn(container, context) {
  this.container = container;
  this.context = context;
  this.header = null;
  this.control = null;
  this.content = null;
  this.active = true;
  this.latestStatusID = null;
}

ImageViewColumn.prototype.inject = function () {
  var instance = this;
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

  // activation button handle
  var deactivatedStatusDiv = document.createElement('div');
  deactivatedStatusDiv.innerText = chrome.i18n.getMessage('deactivated');
  deactivatedStatusDiv.style.textAlign = 'center';
  deactivatedStatusDiv.style.padding = '10px';
  control.activatedSink = function (activated) {
    instance.active = activated;
    
    var content = instance.content.element;
    if (activated) {
      if (content.contains(deactivatedStatusDiv)) {
        content.removeChild(deactivatedStatusDiv);
      }
    }
    else {
      if (!content.contains(deactivatedStatusDiv)) {
        content.insertBefore(deactivatedStatusDiv, content.firstChild);
      }
    }
  };
  
  this.header = header;
  this.control = control;
  this.content = content;
  this.container.appendChild(column);
};

ImageViewColumn.prototype.insert = function (/* LoadProxy */ proxy) {
  if (!this.active) return;

  var instance = this;
  var content = instance.content.element;

  var timelineItem = proxy.item;
  if (timelineItem.imageAnchors.length === 0 && timelineItem.videoContainer == null) return;

  if (this.latestStatusID && timelineItem.id === this.latestStatusID) {
    // duplicated
    return;
  }
  this.latestStatusID = timelineItem.id;
  
  var itemContainer = document.createElement('div');
  var header = document.createElement('div');
  header.style.marginLeft = '5px';
  header.style.display = 'flex';
  header.style.flexDirection = 'row';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';

  var title = document.createElement('div');
  title.innerHTML = timelineItem.displayNameHTML;
  title.style = 'max-width: 65%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13.5px;';
  title.style.cursor = 'pointer';
  title.onmouseover = function () {
    this.style['text-decoration'] = 'underline';
  };
  title.onmouseout = function () {
    this.style['text-decoration'] = 'none';
  };
  title.onclick = function () {
    var authorURL = timelineItem.authorURL;
    window.open(authorURL.href);
  };
  header.appendChild(title);

  // toobar
  // ideal button margin-right: 18px, title max-width: 70%

  var toolbar = document.createElement('div');
  toolbar.style = 'margin-top: 1px; margin-bottom: 1px; overflow: visible;';

  var favButtonDiv = document.createElement('div');
  favButtonDiv.style = 'display: inline-block; margin-right: 12px;';
  
  var boostButtonDiv = document.createElement('div');
  boostButtonDiv.style = 'display: inline-block; margin-right: 12px;';

  var favButton = document.createElement('button');
  favButton.classList.add('icon-button');
  favButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';
  favButton.title = chrome.i18n.getMessage('titleFavButton');

  var boostButton = document.createElement('button');
  boostButton.classList.add('icon-button');
  boostButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';
  boostButton.title = chrome.i18n.getMessage('titleBoostButton');

  var favButtonIcon = document.createElement('i');
  favButtonIcon.classList.add('fa', 'fa-fw', 'fa-star');
  favButtonIcon.style.verticalAlign = 'middle';

  var boostButtonIcon = document.createElement('i');
  boostButtonIcon.classList.add('fa', 'fa-fw', 'fa-retweet');
  boostButtonIcon.style.verticalAlign = 'middle';

  // used when reference gets lost
  var statusLinkDiv = document.createElement('div');
  statusLinkDiv.style = 'display: inline-block; margin-right: 12px;';
  var statusLinkButton = document.createElement('button');
  statusLinkButton.title = chrome.i18n.getMessage('titleStatusButton');
  statusLinkButton.classList.add('icon-button');
  statusLinkButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';
  var statusLinkButtonIcon = document.createElement('i');
  statusLinkButtonIcon.classList.add('fa', 'fa-fw', 'fa-mail-forward');
  statusLinkButtonIcon.style.verticalAlign = 'middle';
  
  // download button
  var downloadDiv = document.createElement('div');
  downloadDiv.style = 'display: inline-block; margin-right: 3px;';
  var downloadButton = document.createElement('button');
  downloadButton.title = chrome.i18n.getMessage('titleDownloadButton');
  downloadButton.classList.add('icon-button');
  downloadButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';
  var downloadButtonIcon = document.createElement('i');
  downloadButtonIcon.classList.add('fa', 'fa-fw', 'fa-download');
  downloadButtonIcon.style.verticalAlign = 'middle';

  // oink button
  var oinkDiv = document.createElement('div');
  oinkDiv.style = 'display: inline-block; margin-right: 3px;';
  var oinkButton = document.createElement('button');
  oinkButton.title = chrome.i18n.getMessage('titleOinkButton');
  oinkButton.classList.add('icon-button', 'oink-button');
  oinkButton.style = 'font-size: 18px; width: 23.1429px; height: 23.1429px; line-height: 18px;';
  var oinkButtonIcon = document.createElement('i');
  oinkButtonIcon.classList.add('fa', 'fa-fw', 'fa-heart');
  oinkButtonIcon.style.verticalAlign = 'middle';

  boostButton.appendChild(boostButtonIcon);
  favButton.appendChild(favButtonIcon);
  statusLinkButton.appendChild(statusLinkButtonIcon);
  downloadButton.appendChild(downloadButtonIcon);
  oinkButton.appendChild(oinkButtonIcon);
  
  boostButtonDiv.appendChild(boostButton);
  favButtonDiv.appendChild(favButton);
  statusLinkDiv.appendChild(statusLinkButton);
  downloadDiv.appendChild(downloadButton);
  oinkDiv.appendChild(oinkButton);
    
  toolbar.appendChild(boostButtonDiv);
  toolbar.appendChild(favButtonDiv);
  if (this.context.getConfig('oinks', false)) {
    toolbar.appendChild(oinkDiv);
  }
  else {
    toolbar.appendChild(downloadDiv);
  }

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
  downloadButton.onclick = function () {
    timelineItem.downloadImages();
  };
  
  oinkButton.onclick = function () {
    var favButton = timelineItem.favouriteButton;
    if (!favButton.classList.contains('active')) {
      favButton.click();
    }
    
    if (instance.context.getConfig('oinkboost', false)) {
      var boostButton = timelineItem.boostButton;
      if (!boostButton.classList.contains('active')) {
        boostButton.click();
      }
    }
    
    timelineItem.downloadImages();
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

  var animated = false;

  // images
  var loader = new ImageLazyLoader();

  if (animated) {
    loader.imageLoaded = function (image) {
      var animation = image.animate([{'opacity': 0, 'easing': 'ease-in'}, {'opacity': 1}], 120);
      animation.onfinish = function () {
        image.style.opacity = '1';
      };
    };
  }
  
  timelineItem.imageAnchors.forEach(function (imageAnchor) {
    var image = document.createElement('img');
    image.style.width = '100%';
    image.style.cursor = 'pointer';
    if (animated) {
      image.style.opacity = '0';
    }
    image.onclick = function () {
      imageAnchor.click();
    };
    
    function isValidURL(url) {
      try {
        var uri = new URL(url);
        return (!!uri);
      }
      catch (e) {
        return false;
      }
    }
    
    function extractBackgroundImageURL(img) {
      if (img.style == null) return null;
      var bg = img.style.backgroundImage;
      if (bg == '') return null;
      var bgURL = bg.slice(4, -1).replace(/"/g, '');
      if (!isValidURL(bgURL)) return null;
      return bgURL;
    }
    
    function thumbnaiImageUri(img) {
      if (instance.context.getConfig('preferspeed', true)) {
        var extractedURL = extractBackgroundImageURL(img);
        if (extractedURL) {
          return extractedURL;
        }
      }
      return img.href;
    }
    
    loader.register(image, thumbnaiImageUri(imageAnchor));
    itemContainer.appendChild(image);
  });

  proxy.sink = function (completionHandler) {
    loader.sink = completionHandler;
    loader.start();
  };

  itemContainer.dataset.statusId = timelineItem.id;
  itemContainer.$referenceLost = function () {
    var child = toolbar.firstChild;
    while (child != null) {
      toolbar.removeChild(child);
      child = toolbar.firstChild;
    }
    
    toolbar.appendChild(statusLinkDiv);
    toolbar.appendChild(downloadButton);
  };
  
  /* comment out until the performance issue gets solved
  if (timelineItem.videoContainer) {
    itemContainer.appendChild(timelineItem.videoContainer);
  }
  */
  
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
