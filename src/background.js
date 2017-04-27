
(function () { 'use strict';  

function DownloadTaskMessage(data) {
  this.items = data.items;
}

DownloadTaskMessage.prototype.handle = function () {
  
  var remaining = this.items.slice(0);
  remaining.reverse();
  
  function consume() {
    if (remaining.length === 0) return;
    var item = remaining.pop();
    chrome.downloads.download(item, function (downloadId) {
      if (downloadId === undefined) return;
      consume();
    });
  }
  consume();
};

function MessageProtocol() { }
MessageProtocol.prototype.interpret = function (raw) {
  console.log(raw);
  if (raw.type == null || raw.data == null) return;
  if (raw.type === 'download') {
    return new DownloadTaskMessage(raw.data);
  }
  return null;
};

function BackgroundPort() {
  this.messageProtocol = new MessageProtocol();
  chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
}

BackgroundPort.prototype.onMessage = function (messageRaw, sender) {
  var message = this.messageProtocol.interpret(messageRaw);
  if (message == null) return;
  message.handle();
};

this.backgroundPort = new BackgroundPort();

}).call(this);
