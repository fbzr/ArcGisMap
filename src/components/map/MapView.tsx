import React, { useEffect, useRef } from "react";
import mapController from "../../controllers/Map";

import "./MapView.css";

const MapView = () => {
  const mapViewRef = useRef(null);

  useEffect(() => {
    mapController.initialize(mapViewRef);
  }, []);
  return <div className="mapView" ref={mapViewRef}></div>;
};

export default MapView;
