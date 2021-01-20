import React, { useEffect, useRef, useState } from "react";
import mapController from "../../controllers/Map";
import ExpandWidget from "./ExpandWidget";

import "./MapView.css";
import Title from "./Title";

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
