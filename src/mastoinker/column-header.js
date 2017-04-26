
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

this.ImageViewColumnHeader = ImageViewColumnHeader;

}).call(this);
