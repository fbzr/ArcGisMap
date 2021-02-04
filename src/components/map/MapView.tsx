import React, { useEffect, useRef } from "react";
// Map Controller
import mapController from "../../controllers/Map";
// Widgets components
import ZipcodeExpandWidget from "./ZipcodeExpandWidget/ZipcodeExpandWidget";
import Title from "./Title/Title";
// CSS
import "./MapView.scss";

const MapView = () => {
  const mapViewRef = useRef(null);
  const zipcodeExpandWidgetRef = useRef(null);
  const titleRef = useRef(null);
  const timeSliderRef = useRef(null);

  const initialize = async () => {
    await mapController.initialize({
      mapView: mapViewRef,
      title: titleRef,
      zipcodeExpandWidget: zipcodeExpandWidgetRef,
      timeSlider: timeSliderRef,
    });
  };

  const cleanup = () => {
    mapViewRef.current = null;
    zipcodeExpandWidgetRef.current = null;
    titleRef.current = null;
    timeSliderRef.current = null;
  };

  useEffect(() => {
    initialize();
    return cleanup;
  }, []);

  return (
    <>
      <div className="mapView" ref={mapViewRef}></div>
      <div id="time-slider" ref={timeSliderRef}></div>
      <Title titleRef={titleRef} />
      <ZipcodeExpandWidget expandWidgetRef={zipcodeExpandWidgetRef} />
    </>
  );
};

export default MapView;
