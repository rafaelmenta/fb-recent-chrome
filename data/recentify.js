const ORDERBY_PARAM = 'sk';

const BASE_PATH = 'https://www.facebook.com';

const TOPNEWS = 'h_nor';
const NEWSFEED = 'nf';
const MOST_RECENT = 'h_chr';

let doc = document;

let getURLObject = function(href) {
  return new URL(href, BASE_PATH);
};

let filterHome = function(element) {
  let url = getURLObject(element.href);
  return url.pathname === '/';
};

let toArray = function(list) {
  return Array.prototype.slice.call(list);
};

let getAbsoluteLinks = function() {
  let links = toArray(doc.querySelectorAll('a[href*="facebook.com"]'));
  return links;
};

let getNewsFeedLinks = function() {
  return toArray(doc.querySelectorAll('a[href*="' + ORDERBY_PARAM + '=' + NEWSFEED + '"]'));
};

let getHomeLinks = function() {
  var absoluteLinks = getAbsoluteLinks();
  var newsFeedLinks = getNewsFeedLinks();
  var facebookLinks = absoluteLinks.concat(newsFeedLinks);

  return Array.prototype.filter.call(facebookLinks, filterHome);
};

let hash = {};

let getLinks = function(sendResponse) {
  let links = getHomeLinks();
  let urlList = links.map((element) => {
    let id = Math.random();
    hash[id] = element;

    return {
      id : id,
      url : element.href
    };
  });

  sendResponse(urlList);
};

let updateUrls = function(urls) {
  urls.map((link) => {
    var domObject = hash[link.id];
    domObject.href = link.url;
  });
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'get.links') {
    getLinks(sendResponse);
  }

  if (request.message === 'update.links') {
    let urls = request.urls;
    updateUrls(urls);
  }
});

// self.port.on('update.url', function() {
//   let url = new URL(doc.location);
//   let isHome = filterHome(url);

//   if (isHome && !url.searchParams.get(ORDERBY_PARAM)) {
//     url.searchParams.set(ORDERBY_PARAM, MOST_RECENT);
//     doc.location = url.href;
//   }
// });

let observer = new MutationObserver (function(mutations) {
  getLinks(function(urlList) {
    if (urlList) {
      chrome.runtime.sendMessage({ message : 'recentify.urls', urls : urlList}, function(response) {
        let urls = response.urls;
        updateUrls(urls);
      });
    }
  });
});

let config = {childList: true};
let body = doc.querySelector('body');

if (body) {
  observer.observe(body, config);
}
