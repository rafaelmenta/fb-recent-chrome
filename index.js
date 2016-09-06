let state = STATES.ON;

let toggleState = function() {
  state = state === STATES.ON ? STATES.OFF : STATES.ON;
  console.log('state changed to ', state);
}

let toggleButton = function(tab) {
  toggleState();

  chrome.tabs.getSelected(null, function(tab) {
    let tabId = tab.id;

    chrome.browserAction.setIcon({
      tabId : tabId,
      path : ICONS[state]['64']
    });

    chrome.browserAction.setTitle({
      tabId : tabId,
      title : 'FB Recent is ' + state
    });



  });
};

let recentifyUrls = function(urls) {
  urls = urls.map((item) => {
    item.url = Core.recentify(item.url);
    return item;
  });

  return urls;
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'recentify.urls') {
    let urls = recentifyUrls(request.urls);
    sendResponse({urls: urls});
  }
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
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
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  if (info.status === 'loading') {
    let url = new URL(tab.url);

    let searchParams = url.searchParams;

    if (url.hostname === 'www.facebook.com' && url.pathname === '/' && searchParams.get(ORDERBY_PARAM) !== MOST_RECENT) {
      searchParams.set(ORDERBY_PARAM, MOST_RECENT)
      chrome.tabs.update(tab.id, {url: url.href});
    }
  }
});

chrome.browserAction.onClicked.addListener(toggleButton);

