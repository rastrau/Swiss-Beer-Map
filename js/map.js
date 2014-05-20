var map;
var ajaxRequest;
var plotlist;
var plotlayers=[];



function initmap() {

	// Size the map window to fit the browser window
	$('#map').height($(window).height()-$('#title').height()-75);
	
	
	// Display "Loading..." symbol
	$("body").addClass("loading");

	
	// Set up the map
	map = new L.Map('map', {
		center: [46.8, 8.2],
		zoom: 8,
		minZoom: 7,
		maxZoom: 18,
		zoomControl: false
	})
	
	
	// Add the zoom-to-original-level-control to the map
	map.addControl(new L.Control.ZoomMin())

	
	// Create tile layers
	var lyr = L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.c7d2024a/{z}/{x}/{y}.png',
										{ attribution: '&copy; OpenStreetMap contributors / tiles courtesy of Mapbox' });
	  
	var lyr2 = L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.bc17bb2a/{z}/{x}/{y}.png',
										{ minzoom: 0,
										  attribution: 'Basemap &copy; <a href="http://www.openstreetmap.org">OSM</a> contributors / tiles courtesy of <a href="http://www.mapbox.com">Mapbox</a>. A project by <a href="http://www.ralphstraumann.ch">Ralph Straumann</a> of <a href="http://www.geobeer.ch">geobeer.ch</a>' });

	var bw = new L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
							 { attribution: 'Map data &copy; OSM contributors' });

	map.addLayer(lyr2);
	
	
	// Add the switch-to-fullscreen-control to the map
	L.control.fullscreen().addTo(map);
	
	
	// Add miniature overview map
	//var miniMap = new L.Control.MiniMap(bw, { toggleDisplay: true }).addTo(map);

	
	var spreadsheet_key = '0AjZGu43X1ynxdERiVThpS3p6RUMtRDZyeHdVRXJqdkE';

	Tabletop.init( { key: spreadsheet_key,
                     callback: mapInfo,
                     simpleSheet: true } )

	function mapInfo(data) {
	  
	  var classify_clusters = function (cluster) {
		var childCount = cluster.getChildCount();

		var c = ' marker-cluster-';
		if (childCount < 5) { c += 'small'; }
		else if (childCount < 10) { c += 'medium'; }
		else { c += 'large'; }

		return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
		};
	  
	  var markers = new L.MarkerClusterGroup({ showCoverageOnHover: false,
											   maxClusterRadius: 40,
											   disableClusteringAtZoom: 14,
											   iconCreateFunction: classify_clusters });
	  
	  for (var i = 0; i < data.length; i++) {
		
		// Build marker
		try {
			marker_location = new L.LatLng(data[i].geolatitude, data[i].geolongitude);
		}
		catch (e) {
			continue;
		}
		if (data[i].owner == 'Heineken AG') {
			var icon_url = 'img/beer_icon_heineken.png'
		}
		else if (data[i].owner == 'Carlsberg A/S') {
			var icon_url = 'img/beer_icon_carlsberg.png'
		}
		else {
			var icon_url = 'img/beer_icon.png'
		}
		
		marker = new L.Marker(marker_location,
							{ icon: L.icon( { iconUrl: icon_url,
											  iconSize: [24, 25],
											  iconAnchor: [12, 12],
											  popupAnchor: [-3, -12]
											})
				});
    
    	// Build popup
    	var popup = "<div class=popup_box" + "id=" + i+1 + ">";
    	popup += "<div class='popup_box_header'><strong><a href='" + data[i].website + "'>" + data[i].brewery + "</a></strong></div>";
		popup += data[i].owner;
    	popup += "<hr/>";
    	popup += data[i].address + "<br/>";
    	popup += data[i].place + "<br/><hr/>";
		popup += "<a href='mailto:ralph.straumann@gmail.com?Subject=Swiss Beer Map Error: ID ";
		popup += i+1;
		popup += "&body=Hello Ralph, I have found the following error with the Swiss Beer Map:'>Report an error</a>";
    	popup += "</div>";
    	
		// Add popup to marker, add marker to marker-cluster group
		marker.bindPopup(popup);
		
		markers.addLayer(marker);
		
	  }
	  
	  map.addLayer(markers);

	// Remove "Loading..." symbol
	$("body").removeClass("loading");
	  
	};
	
	
	
	// Add map legend to bottom-left corner
	var legend = L.Control.extend({
		options: { position: 'bottomleft' },
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'legend');
			container.innerHTML = "<img src='img/beer_icon.png' height=18px/> Independent brewer<br><img src='img/beer_icon_carlsberg.png' height=18px/> Brewer owned by Carlsberg A/S<br><img src='img/beer_icon_heineken.png' height=18px/> Brewer owned by Heineken AG<br><a href='https://docs.google.com/forms/d/1L3_8pJ3zrXg7faPyVTSzP_MhXPMgcYYiNF82852msV8/viewform'><b>Suggest additional breweries</b></a><br><a href='https://docs.google.com/spreadsheet/pub?key=0AjZGu43X1ynxdERiVThpS3p6RUMtRDZyeHdVRXJqdkE&single=true&gid=0&output=csv'>Download the data</a> / <a href='https://github.com/rastrau/SwissBeerMap'>Get the code</a>";
			
			return container;
		}
	});
	map.addControl(new legend());
	
	
	// Add social links to top-right corner
	var social_links = L.Control.extend({
		options: { position: 'topright' },
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'social');
			container.innerHTML = "<a target='_blank' href='http://twitter.com/share?via=rastrau&text=Check%20out%20the%20%23SwissBeerMap:'><img src='img/twitter.png' /></a>&nbsp; <a target='_blank' href='http://www.facebook.com/sharer/sharer.php?u=http://www.ralphstraumann.ch/projects/swiss-beers'><img src='img/facebook.png' /></a>";
			return container;
		}
	});
	map.addControl(new social_links());
	
	
	// Resize map when browser window is resized
	$(window).resize(function(){
		$('#map').height($(window).height()-$('#title').height()-75);
	});
	
}
