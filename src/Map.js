import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Directions from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { useToast } from "izitoast-react";
import "izitoast-react/dist/iziToast.css";
import './Directions.css'

mapboxgl.accessToken = "pk.eyJ1IjoiaGFtZWRiaiIsImEiOiJjbGhnMGlkZG8wZTdlM2Z0ZWZja3FuZ2hrIn0.XyE4xvXlVytKa0Y164W8Mw";
mapboxgl.setRTLTextPlugin(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
    null,
    true // Lazy load the plugin
);

let lng = 51.34;
let lat = 35.72;
let zoom = 13;
let refPos = []
let destPos = []
let symbol = new mapboxgl.Marker();
let distance = null
let duration = null
let marker = null

function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [submitText, setSubmitText] = useState("تأیید مبدأ");
    const [myPosition, setMyPosition] = useState(null);
    const [done, setDone] = useState(false);

    const showGPSErrorMessage = useToast({
        // title: "تیم جدید ایجاد شد",
        message: "دسترسی به مکان یاب شما غیرفعال است",
        theme: "light",
        icon: "warn",
        color: "red",
        timeout: 2000
    });

    function showPosition(position) {
        setMyPosition([position.coords?.longitude, position.coords?.latitude])
    }

    useEffect(() => {
        if (navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(showPosition)
        }
    }, [])

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: zoom
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-left");
        map.current.addControl(directions, 'top-right');
    }, []);

    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
            lng = map.current.getCenter().lng;
            lat = map.current.getCenter().lat;
            zoom = map.current.getZoom().toFixed(2);
            symbol.setLngLat([map.current.getCenter().lng, map.current.getCenter().lat])
        });
    }, []);

    useEffect(() => {
        if (map.current) {
            symbol.setLngLat([map.current.getCenter().lng, map.current.getCenter().lat]).addTo(map.current);
        }
    }, [])

    const directions = new Directions({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        profile: 'mapbox/driving-traffic',
        alternatives: false,
        geometries: 'geojson',
        controls: { instructions: false },
        flyTo: false,
        interactive: false
    });

    const handleMarker = () => {
        if (map.current && !done) {
            marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
        }
        if (submitText === "تأیید مبدأ") {
            setSubmitText("تأیید مقصد");
            refPos = [lng, lat]
            directions.setOrigin(refPos)
        } else if (submitText === "تأیید مقصد") {
            symbol.remove();
            destPos = [lng, lat]
            directions.setDestination(destPos)
            setDone(true);
            directions.on('route', (e) => {
                const route = e.route[0];
                distance = route.distance / 1000; // in meters
                duration = route.duration / 60; // in seconds
                if (duration < 60) {
                    setSubmitText(distance.toFixed(1) + " کیلومتر" + ", " + duration.toFixed(0) + " دقیقه");
                } else {
                    const minutes = duration % 60;
                    duration = Math.floor(duration / 60);
                    setSubmitText(distance.toFixed(1) + " کیلومتر" + ", " + duration + " ساعت و" + minutes.toFixed(0) + "دقیقه");
                }
            });
        }

    }

    const handleCurrentPosition = () => {
        if (myPosition) {
            const el = document.createElement('div');
            el.className = 'current-marker';
            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el).setLngLat(myPosition).addTo(map.current);
            map.current.flyTo({
                center: myPosition,
                zoom: 18,
                essential: true
            })
        } else {
            showGPSErrorMessage();
        }
    }

    const handleReset = () => {
        // if (directions.current) {
        //     // Remove all routes and markers
        //     directions.current.removeRoutes();
        //     directions.current.removeOrigin();
        //     directions.current.removeDestination();
        // }
    }

    return (
        <div className='map-section'>
            <div ref={mapContainer} className="map-container" />
            <button className="submit" onClick={handleMarker}>{submitText}</button>
            <div className="current-location" onClick={handleCurrentPosition}>
                <img src="/locating.svg" alt="" />
            </div>
            <div className="reset" onClick={handleReset}>
                <img src="/reset.svg" alt="" />
            </div>
        </div>
    )
}

export default Map;