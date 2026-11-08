/* Optional customer location for matching the nearest provider. Only runs when the customer taps the button. */
window.MZGeo={pos:null,
 ask:function(statusEl,btn){
  if(!navigator.geolocation){if(statusEl)statusEl.textContent='Location is not available on this device.';return}
  if(btn)btn.disabled=true;if(statusEl)statusEl.textContent='Finding your location...';
  navigator.geolocation.getCurrentPosition(function(p){MZGeo.pos={lat:Math.round(p.coords.latitude*1e5)/1e5,lng:Math.round(p.coords.longitude*1e5)/1e5};if(statusEl)statusEl.textContent='Location added. We will send the nearest provider.';if(btn)btn.disabled=false},
   function(){if(statusEl)statusEl.textContent='Location not shared. Type your area instead.';if(btn)btn.disabled=false},{enableHighAccuracy:true,timeout:10000,maximumAge:60000})},
 fields:function(){var o={};if(MZGeo.pos){o.lat=MZGeo.pos.lat;o.lng=MZGeo.pos.lng}return o},
 link:function(){return MZGeo.pos?'https://maps.google.com/?q='+MZGeo.pos.lat+','+MZGeo.pos.lng:''}};
