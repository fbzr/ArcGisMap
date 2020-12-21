import React, { useRef, useEffect } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ArcGISMap from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import popupTemplate from "./utils/popupTemplate";
import "./ArcGisMap.css";

const ArcGisMap = () => {
  const mapDiv = useRef(null);
  const layerViewRef = useRef(null);

  useEffect(() => {
    console.log("useEffect");
    if (mapDiv.current) {
      /**
       * Initialize application
       */

      const layer = new FeatureLayer({
        url:
          "https://services1.arcgis.com/F1v0ufATbBQScMtY/ArcGIS/rest/services/FireIncidents/FeatureServer/2",
        popupTemplate,
      });

      const map = new ArcGISMap({
        basemap: "topo-vector",
        layers: [layer],
      });

      const mapView = new MapView({
        map,
        container: mapDiv.current,
        center: [-115.1398, 36.1699], // Sets the center point of the view at a specified lon/lat - Las Vegas: 36.1699° N, 115.1398° W
        zoom: 12,
      });

      mapView.whenLayerView(layer).then((layerView) => {
        layerViewRef.current = layerView;
      });
    }
  }, []);

  const buttonClick = () => {
    console.log("button clicked");
    if (layerViewRef.current.filter) {
      layerViewRef.current.filter = null;
    } else {
      layerViewRef.current.filter = {
        where: "LOCADDRESS = '98 S MARTIN L KING BLVD' OR YEAR_ = '2004'",
      };
    }
  };

  return (
    <>
      <button onClick={buttonClick}>Filter</button>
      <div className="mapDiv" ref={mapDiv}></div>
    </>
  );
};

export default ArcGisMap;
