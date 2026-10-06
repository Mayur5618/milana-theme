(function() {
  const BASE_URL = 'https://cdn-air-reviews.avada.io';
  // const BASE_URL = 'https://avada-sales-pop-staging.firebaseapp.com';
  const scriptElement = document.createElement('script');
  scriptElement.type = 'text/javascript';
  scriptElement.async = !0;
  scriptElement.src = `${BASE_URL}/scripttag/air-reviewsblock-main.min.js?v=${new Date().getTime()}`;
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(scriptElement, firstScript);
})();
