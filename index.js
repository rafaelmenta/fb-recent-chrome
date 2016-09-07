chrome.storage.sync.get({
  'buttonState' : STATES.ON
}, (options) => {
  state = options.buttonState;
  changeIcon();
  changeTitle();
  toggleFeature();

});

let toggleFeature = function() {
  if (state === STATES.ON) {
    on();
  } else {
    off();
  }
};

let toggleState = function() {
  state = state === STATES.ON ? STATES.OFF : STATES.ON;
  chrome.storage.sync.set({
    buttonState : state
  });
}

let changeIcon = function() {
  chrome.browserAction.setIcon({
    path : ICONS[state]['128']
  });
};

let changeTitle = function() {
  chrome.browserAction.setTitle({
    title : 'FB Recent is ' + state
  });
}

let toggleButton = function() {
  toggleState();
  changeIcon();
  changeTitle();
  toggleFeature();
};

let recentifyUrls = function(urls) {
  urls = urls.map((item) => {
    item.url = Core.recentify(item.url);
    return item;
  });

  return urls;
};

let f1 = function(request, sender, sendResponse) {
  if (request.message === 'recentify.urls') {
    let urls = recentifyUrls(request.urls);
    sendResponse({urls: urls});
  }
};

let f2 = function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      let urls;
      if (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: 'get.links'}, function(response) {
          if (response && response.urls) {
            urls = recentifyUrls(response.urls);
            chrome.tabs.sendMessage(tabs[0].id, { message : 'update.links', urls: urls});
          }
        });
      }
    });
  }
};

let f3 = function(tabId, info, tab) {
  if (info.status === 'loading') {
    let url = new URL(tab.url);

    let searchParams = url.searchParams;

    if (url.hostname === 'www.facebook.com' && url.pathname === '/' && searchParams.get(ORDERBY_PARAM) !== MOST_RECENT) {
      searchParams.set(ORDERBY_PARAM, MOST_RECENT)
      chrome.tabs.update(tab.id, {url: url.href});
    }
  }
};

let on = function() {
  chrome.runtime.onMessage.addListener(f1);
  chrome.tabs.onUpdated.addListener(f2);
  chrome.tabs.onUpdated.addListener(f3);

  chrome.browserAction.setBadgeText({
    text : ''
  });
};

let off = function() {
  chrome.runtime.onMessage.removeListener(f1);
  chrome.tabs.onUpdated.removeListener(f2);
  chrome.tabs.onUpdated.removeListener(f3);
  chrome.browserAction.setBadgeText({
    text : 'off'
  });
};

chrome.browserAction.onClicked.addListener(toggleButton);
