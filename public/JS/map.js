
	mapboxgl.accessToken = maptoken;
    
    // Use geometry coordinates if available, otherwise use default center
    let centerCoords = listing.geometry && listing.geometry.coordinates ? listing.geometry.coordinates : [72.8479, 19.0760]; // Default to Mumbai
    
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
        center: centerCoords, // starting position [lng, lat]
        zoom: 12 // starting zoom
        });
        
        
        
        const marker = new mapboxgl.Marker({color:"red"})
        .setLngLat(centerCoords)
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setHTML(` <h4>${listing.title}</h4><p>Location: ${listing.location || 'Not specified'}</p><p>Coordinates: ${centerCoords[1].toFixed(4)}, ${centerCoords[0].toFixed(4)}</p>`))
        .addTo(map);