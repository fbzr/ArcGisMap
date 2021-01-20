import React, { useEffect, useRef, useState } from "react";
// Map Controller
import mapController from "../../controllers/Map";
// Widgets components
import ExpandWidget from "./ExpandWidget";
import Title from "./Title";
// CSS
import "./MapView.css";

const MapView = () => {
  const mapViewRef = useRef(null);
  const expandWidgetRef = useRef(null);
  const titleRef = useRef(null);

  const [loading, setLoading] = useState<boolean>(true);

  const initialize = async () => {
    await mapController.initialize({
      mapView: mapViewRef,
      expand: expandWidgetRef,
      title: titleRef,
    });

    setLoading(false);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <div className="mapView" ref={mapViewRef}></div>
      <Title titleRef={titleRef} />
      <ExpandWidget loading={loading} expandWidgetRef={expandWidgetRef} />
    </>
  );
};

export default MapView;
