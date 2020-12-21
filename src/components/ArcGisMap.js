import React, { useRef, useEffect } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ArcGISMap from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import "./ArcGisMap.css";

const ArcGisMap = () => {
  const mapDiv = useRef(null);

  useEffect(() => {
    if (mapDiv.current) {
      /**
       * Initialize application
       */
      const map = new ArcGISMap({
        basemap: "topo-vector",
      });

      const view = new MapView({
        map,
        container: mapDiv.current,
        center: [-115.1398, 36.1699], // Sets the center point of the view at a specified lon/lat - Las Vegas: 36.1699° N, 115.1398° W
        zoom: 12, // Sets the zoom LOD to 11
      });

      const popupTemplate = {
        // autocasts as new PopupTemplate()
        title: "Fire details",
        content: [
          {
            // It is also possible to set the fieldInfos outside of the content
            // directly in the popupTemplate. If no fieldInfos is specifically set
            // in the content, it defaults to whatever may be set within the popupTemplate.
            type: "fields",
            fieldInfos: [
              {
                fieldName: "ADDRESS",
                label: "Address",
              },
              {
                fieldName: "ZIP",
                label: "Zip Code",
              },
              {
                fieldName: "YEAR_",
                label: "Year",
              },
            ],
          },
        ],
      };

      const layer = new FeatureLayer({
        url:
          "https://services1.arcgis.com/F1v0ufATbBQScMtY/ArcGIS/rest/services/FireIncidents/FeatureServer/2",
        popupTemplate,
      });

      map.add(layer);
    }
  }, []);
  return <div className="mapDiv" ref={mapDiv}></div>;
};

export default ArcGisMap;
