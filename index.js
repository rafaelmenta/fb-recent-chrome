
console.log(STATES, ICONS);

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
}

  chrome.browserAction.onClicked.addListener(toggleButton);

