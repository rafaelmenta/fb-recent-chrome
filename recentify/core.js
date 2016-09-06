let Core = {};

Core._recentifyUrl = function(url) {
  let searchParams = url.searchParams;
  if (searchParams.get(ORDERBY_PARAM) === TOPNEWS) return;

  searchParams.set(ORDERBY_PARAM, MOST_RECENT);

  return url.href;
};

Core.recentify = function(link) {
  let url = new URL(link);
  let recentUrl = Core._recentifyUrl(url);
  return recentUrl;
};