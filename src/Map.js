import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = "pk.eyJ1IjoiaGFtZWRiaiIsImEiOiJjbGhnMGlkZG8wZTdlM2Z0ZWZja3FuZ2hrIn0.XyE4xvXlVytKa0Y164W8Mw";
mapboxgl.setRTLTextPlugin(
'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
null,
true // Lazy load the plugin
);
function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(51.34);
    const [lat, setLat] = useState(35.72);
    const [zoom, setZoom] = useState(13);
    const [myPosition, setMyPosition] = useState([51.34, 35.72])
    let symbol = new mapboxgl.Marker();

    function showPosition(position) {
        setMyPosition([position.coords?.longitude, position.coords?.latitude])
    }

    useEffect(() => {
        if (navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(showPosition)
        }
    })

    useEffect(() => {
        if (map.current) return; // initialize map only once
            map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: zoom
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    });

    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
            map.current.on('move', () => {
            setLng(map.current.getCenter().lng);
            setLat(map.current.getCenter().lat);
            setZoom(map.current.getZoom().toFixed(2));
            symbol.setLngLat([map.current.getCenter().lng, map.current.getCenter().lat])
        });
        // const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
    });
    
    useEffect(() => {
        if (map.current) {
            symbol.setLngLat([map.current.getCenter().lng, map.current.getCenter().lat]).addTo(map.current);
        }   
    }, [])

    const handleMarker = () => {
        if (map.current) {
            const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
        }
    }

    const handleCurrentPosition = () => {
        map.current.flyTo({
            center: myPosition,
            zoom: 18,
            essential: true
        })
    }

    return (
        <div className='map-section'>
            <div className="sidebar">
                Longitude: {lng.toFixed(3)} | Latitude: {lat.toFixed(3)} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} className="map-container" />
            <button className="submit" onClick={handleMarker}>Submit</button>
            <div className="current-location" onClick={handleCurrentPosition}>
                <img src="/locating.svg" alt="" />
            </div>
        </div>
    )
}

export default Map;