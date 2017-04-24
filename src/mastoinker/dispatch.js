
(function () { 'use strict';	


function Debounce(delay, callback) {
  this.delay = delay;
  this.items = [];
  this.callback = callback;
}

Debounce.prototype.start = function () {
  setTimeout(this.finalize.bind(this), this.delay);
};

Debounce.prototype.finalize = function () {
  this.callback(this.items);
};

Debounce.prototype.add = function (item) {
  this.items.push(item);
};


function LoadProxy(item) {
  this.item = item;
  this.sink = null; // loaded
}

LoadProxy.prototype.load = function (completed) {
  if (this.sink === null) {
    // abandonded proxy
    completed();
    return;
  }
  this.sink(completed);
};


function LoadQueue() {
  this.items = [];
  this.sink = null; // consumed
  this.delay = 200; // an interval to next chunk load
}

LoadQueue.prototype.consume = function (proxies) {
  var instance = this;
  var count = 0;
  function onProxyLoadComplete() {
    count += 1;
    if (count === proxies.length) {
      if (instance.sink !== null) {
        setTimeout(instance.sink, instance.delay);
      }
    }
  }

  for (var proxy of proxies) {
    proxy.load(onProxyLoadComplete);
  }
};


function LoadDispatcher() {
  this.sink = null; /* added */
  this.debounce = null;
  this.proxies = [];
  this.queue = new LoadQueue();
  this.queue.sink = this.update.bind(this);
  this.kConcurrentLoad = 3;
}

LoadDispatcher.prototype.dispatch = function (item) {
  if (this.debounce === null) {
    this.debounce = new Debounce(100, this.consume.bind(this));
    this.debounce.start();
  }
  this.debounce.add(item);
};

// private
LoadDispatcher.prototype.consume = function (items) {
  this.debounce = null;

  // TimelineItem comparator
  function byDatetimeDesc(lhs, rhs) {
    return lhs.datetime - rhs.datetime;
  }

  var newProxies = [];
  items.sort(byDatetimeDesc)
  for (var item of items) {
    var proxy = new LoadProxy(item);
    newProxies.push(proxy);
    this.proxies.push(proxy);
  }

  if (this.sink !== null) {
    // proxies will be loaded in flight
    for (var proxy of newProxies) {
      this.sink(proxy);
    }
  }

  this.update();
};

LoadDispatcher.prototype.update = function () {

  // LoadProxy comparator
  function byDatetimeDesc(lhs, rhs) {
    return rhs.item.datetime - lhs.item.datetime;
  }

  this.proxies.sort(byDatetimeDesc);
  var loaded = this.proxies.slice(0, this.kConcurrentLoad);
  this.proxies = this.proxies.slice(this.kConcurrentLoad);

  if (loaded.length === 0) return;

  this.queue.consume(loaded);
};

this.LoadDispatcher = LoadDispatcher;

}).call(this);

