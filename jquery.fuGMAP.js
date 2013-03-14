/* =========================================================
// jquery.fuGMAP.js 0.0.3.2
// Copyright Chris McKee <pcdevils[at]gmail.com> 2010
// chrismckee.co.uk // http://bit.ly/fuGMAP
// Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
// ========================================================= */

(function($) {

   var geocoder = new GClientGeocoder();
   var rando = Math.round(Math.random() * 12);
 
   $.fn.fuGMAP = function(settings) {
     var config = {
		latitude:				55.378051,
		longitude:				-3.435973,
		address: 				"",
		url:					"",
		zoom:					7,
		markerxml:				"",
		kmlfile:				"",
		markers:				[],
		controls:				[],
		maptype:				'G_NORMAL_MAP',
		scrollwheel:			true,
		popup:					"iframe",
		icon:
		{
			image:				"http://www.google.com/mapfiles/marker.png",
			shadow:				"http://www.google.com/mapfiles/shadow50.png",
			iconsize:			"",
			shadowsize:			"",
			iconanchor:		 	"",
			infowindowanchor:	""
		},
		fudebug:				false
	};
	
	/* Explode Options */
	var op = $.extend({}, config, settings);
	var eMap, bounds;
	var latlngbounds = new GLatLngBounds( );
	
	// Check if the browser is compatible with Google Maps
	if (!window.GBrowserIsCompatible || !GBrowserIsCompatible()) return this;
 
    return this.each(function() {
		// element-specific code here
		   eMap = new GMap2(this);
		   eMap.setMapType(eval(op.maptype));
		   eMap.setCenter(new GLatLng(op.latitude, op.longitude), op.zoom);
		   bounds = eMap.getBounds();
		/* ICON MAKER */
		var bIcon = new GIcon(G_DEFAULT_ICON);
			if(op.icon.image)  bIcon.image = op.icon.image;
			if(op.icon.shadow) bIcon.shadow = op.icon.shadow
			if(isArray(op.icon.iconsize))   bIcon.iconSize = new GSize(op.icon.iconsize[0], op.icon.iconsize[1]);
			if(isArray(op.icon.shadowsize)) bIcon.shadowSize = new GSize(op.icon.shadowsize[0], op.icon.shadowsize[1]);
			if(isArray(op.icon.iconanchor)) bIcon.iconAnchor = new GPoint(op.icon.iconanchor[0], op.icon.iconanchor[1]);
		/* EO ICON MAKER */	

	/* MAP CONTROLS */
	var MapControls = op.controls.length;
		if(op.controls.length == 0){ eMap.setUIToDefault(); }
		else{while(MapControls--) eval('eMap.addControl(new ' + op.controls[MapControls] + '());');}
	/* EO MAP CONTROLS */
	
	/* DISABLE SCROLLWHEEL */
	if (op.scrollwheel == true && op.controls.length !== 0) { eMap.enableScrollWheelZoom(); }
	   
	
	/* MARKERS ARRAY LOOP */
	for (var i = 0; i < op.markers.length; i++)
	{
        var marker = op.markers[i];     
		
		// LOCATION marker
		if(marker.longitude && marker.latitude)
		{
		  var point = new GPoint(marker.longitude, marker.latitude);
          gMarker = new GMarker(point, bIcon);
		  
		  if(marker.url){
				var pop = op.popup === "iframe" ? "<iframe frameborder='0' hspace='0' src='" + marker.url + "' id='tb_iframecontent' name='tb_iframecontent'\/>" : '<div class="gmap_marker" id="gmap-popup">'+marker.url+'<\/div>';
				GEvent.addListener(gMarker, "click", function(){gMarker.openInfoWindowHtml(pop);});
			  }	
		  
		  if(gMarker){
			eMap.addOverlay(gMarker); 
			eMap.setCenter(point, op.zoom);
		  }
        }

		
		// ADDRESS GeoCoder
        if(marker.address)
		{
			$.fn.fuGMAP.geocodeAddress(marker.address, geocoder, eMap, bounds, bIcon, marker.url, op.popup, op.zoom, op.fudebug);
		}
		
	}
	/* EO MARKERS ARRAY LOOP */
	
	// MARKER XML File
	if(op.markerxml)
	{
		$.fn.fuGMAP.MarkerXML(op.markerxml, eMap, bounds, bIcon, op.popup, op.zoom);
	}
	//
    });
 
    //return this;
   };
   
	/* 
   Method: Uses GMaps getLatLng to geocode address
   Returns: Adds Google Marker (obj) returns Bool
   */
   	$.fn.fuGMAP.geocodeAddress = function(addr, gcd, eMap, bounds, icon, url, popup, zoom,dbug)
	{
      if (gcd) {
        gcd.getLatLng(
          addr,
          function(point) {
            if (!point) {
              try{console.log(addr + " not found");}catch(e){if(dbug){ alert(addr + " not found");}/* IE Fix, Race Condition */}
            } else {
              var marker = new GMarker(point, icon);
			  if(url)
			  {
				var pop = popup === "iframe" ? "<iframe frameborder='0' hspace='0' src='" + url + "' id='tb_iframecontent' name='tb_iframecontent'\/>" : '<div class="gmap_marker" id="gmap-popup">'+url+'<\/div>';
				GEvent.addListener(marker, "click", function(){marker.openInfoWindowHtml(pop);});
			  }
			  
			  if(marker){ 
			  eMap.setCenter(point, zoom);
			  eMap.addOverlay(marker); 
			  }
			  return marker ? true : false;
            }
          }
        );
      }
	};
	
	
	$.fn.fuGMAP.MarkerXML = function(file, eMap, bounds, Icon, popup, zoom)
	{
		GDownloadUrl(file,
					function(data) {
						var xml = GXml.parse(data);
						var markers = xml.documentElement.getElementsByTagName("marker");
						for (var i = 0; i < markers.length; i++)
						{	
							eMap.addOverlay($.fn.fuGMAP.CreateMarker(eMap, zoom, Icon, markers[i].getAttribute("lat"), markers[i].getAttribute("lng"), markers[i].getAttribute("html"), popup));
						}
					});
	};	
	
   
    $.fn.fuGMAP.CreateMarker = function(eMap, Zoom, icon, lat, lng, sHTML, PopUp) {
        var latlngPoint = new GLatLng(lat, lng);
        var marker = new GMarker(latlngPoint, icon);
		if(PopUp === "iframe" && (!/^http:\/\//.test(sHTML))){ PopUp = "text"; }
		if(sHTML){
			var sPop = PopUp === "iframe" ? "<iframe frameborder='0' hspace='0' src='" + sHTML + "' id='tb_iframecontent' name='tb_iframecontent'\/>" : '<div class="gmap_marker" id="gmap-popup">' + sHTML + '<\/div>';
			GEvent.addListener(marker, "click", function () {
			  marker.openInfoWindowHtml(sPop)
			});
		}
		eMap.setCenter(latlngPoint, Zoom);
		
        return marker		
    }

   
   /* 
   Method: Test if passed variable is an Array
   Returns: Bool
   */
   var isArray = function(e)
   {
	return typeof(e) == 'object' && (e instanceof Array);
   }
 
})(jQuery);