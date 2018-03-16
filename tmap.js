// ==UserScript==
// @id TMap
// @name IITC Plugin: TMap
// @category Portal Info
// @version 1.0.0
// @namespace http://melomano.github.io/tmap.js
// @description 포탈을 T Map 으로 안내합니다.
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
  plugin_info.buildName = 'TMap';

  // Datetime-derived version of the plugin
  plugin_info.dateTimeVersion = '20180222103500';

  // ID/name of the plugin
  plugin_info.pluginId = 'TMap';

  // The entry point for this plugin.
  function setup() {
    map.setView([36,128], 8);

    setTimeout(function() {
      document.getElementById('chatcontrols').style.display = 'none';
      document.getElementById('chat').style.display = 'none';
      document.getElementById('chatinput').style.display = 'none';
      document.querySelector('.leaflet-top.leaflet-right').style.display = 'none';
    }, 300);

    window.addHook('portalDetailLoaded', loadData);

    function loadData(data) {
      if (document.getElementById('tmap')) {return;}
      
      var lat = data.details.latE6/1E6;
      var lng = data.details.lngE6/1E6;
      var divEl = document.createElement('div');
      var aEl = document.createElement('a');
      var textNode = document.createTextNode('TMap');
      var portalInfo;

      aEl.appendChild(textNode);
      aEl.setAttribute('data-lat', lat);
      aEl.setAttribute('data-lng', lng);
      aEl.style.fontSize = '32px';
      divEl.id = 'tmap';
      divEl.style.textAlign = 'center';
      divEl.style.padding = '10px';
      divEl.appendChild(aEl);
      document.getElementById('sidebar').appendChild(divEl);

      aEl.addEventListener('touchend', function() {
        portalInfo = {
          name: data.details.title,
          lat: lat,
          lng: lng
        };

        window.postMessage(JSON.stringify(portalInfo));
      });
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
