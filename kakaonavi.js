// ==UserScript==
// @id KakaoNavi
// @name IITC Plugin: Kakao Navi
// @category Portal Info
// @version 1.0.0
// @namespace http://melomano.github.io/hello-iitc.js
// @description 포탈을 카카오 내비로 안내합니다.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @grant none
// ==/UserScript==

// Wrapper function that will be stringified and injected
// into the document. Because of this, normal closure rules
// do not apply here.
function wrapper(plugin_info) {
  // Make sure that window.plugin exists. IITC defines it as a no-op function,
  // and other plugins assume the same.
  if(typeof window.plugin !== 'function') window.plugin = function() {};

  // Name of the IITC build for first-party plugins
  plugin_info.buildName = 'kakaonavi';

  // Datetime-derived version of the plugin
  plugin_info.dateTimeVersion = '20171117103500';

  // ID/name of the plugin
  plugin_info.pluginId = 'kakaonavi';

  // The entry point for this plugin.
  function setup() {
    window.addHook('portalDetailLoaded', loadData);

    function loadData(data) {
      var lat = data.details.latE6/1E6;
      var lng = data.details.lngE6/1E6;
      var asideEl = document.createElement('aside');
      var aEl = document.createElement('a');
      var textNode = document.createTextNode('Kakao Navi');

      aEl.appendChild(textNode);
      aEl.setAttribute('data-lat', lat);
      aEl.setAttribute('data-lng', lng);
      asideEl.appendChild(aEl);
      document.querySelector('#portaldetails .linkdetails').appendChild(asideEl);

      aEl.addEventListener('touchend', function() {
        navi();
      });

      Kakao.init('4404f1315c5f1d01a322b5a2fad6e155');

      function navi(){
          Kakao.Navi.start({
              name: data.details.title,
              x: lng,
              y: lat,
              coordType: 'wgs84'
          });
      }
    }
  }

  // Add an info property for IITC's plugin system
  setup.info = plugin_info;

  // Make sure window.bootPlugins exists and is an array
  if (!window.bootPlugins) window.bootPlugins = [];
  // Add our startup hook
  window.bootPlugins.push(setup);
  // If IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === 'function') setup();
}

// <script src="//developers.kakao.com/sdk/js/kakao.min.js"></script>
var scriptKakao = document.createElement('script');

scriptKakao.setAttribute('src', '//developers.kakao.com/sdk/js/kakao.min.js');
(document.body || document.head || document.documentElement).appendChild(scriptKakao);

// Create a script element to hold our content script
var script = document.createElement('script');
var info = {};

// GM_info is defined by the assorted monkey-themed browser extensions
// and holds information parsed from the script header.
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  };
}

// Create a text node and our IIFE inside of it
var textContent = document.createTextNode('('+ wrapper +')('+ JSON.stringify(info) +')');
// Add some content to the script element
script.appendChild(textContent);
// Finally, inject it... wherever.
(document.body || document.head || document.documentElement).appendChild(script);