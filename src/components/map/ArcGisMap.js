import React, { useRef, useEffect, useState } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ArcGISMap from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Expand from "@arcgis/core/widgets/Expand";
import popupTemplate from "./utils/popupTemplate";
import "./ArcGisMap.css";

const ArcGisMap = () => {
  const mapDiv = useRef(null);
  const filterDiv = useRef(null);
  const titleDiv = useRef(null);
  const layerViewRef = useRef(null);

  const [view, setView] = useState(null);
  const [zipCodeList, setZipCodeList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect 2");
    if (!loading) {
      // layerViewRef.whenLayerView(testLayer).then((layerView) => {
      const query = layerViewRef.current.createQuery();
      // const query = layerViewRef.current.createQuery();
      query.where = `1=1`;
      query.outFields = ["zip"];
      query.returnDistinctValues = true; // return only unique values

      layerViewRef.current.queryFeatures(query).then(({ features }) => {
        console.log("***features + result***", features);

        // create list of zip code
        const list = features.reduce((zipList, feature) => {
          const zipCode = feature?.attributes?.ZIP;
          if (zipCode) {
            zipList.push(zipCode);
          }
          return zipList;
        }, []);

        setZipCodeList(list);
      });
    }
  }, [loading]);

  useEffect(() => {
    const init = async () => {
      console.log("useEffect 1");
      if (mapDiv.current) {
        /**
         * Initialize application
         */

        const map = new ArcGISMap({
          basemap: "topo-vector",
        });

        const mapView = new MapView({
          map,
          container: mapDiv.current,
          center: [-115.1398, 36.1699], // Sets the center point of the view at a specified lon/lat - Las Vegas: 36.1699° N, 115.1398° W
          zoom: 12,
        });

        // create filter button
        const filterExpand = new Expand({
          view: mapView,
          content: filterDiv.current,
          expandIconClass: "esri-icon-filter",
          group: "top-left",
        });

        // Add filter button to map
        mapView.ui.add(filterExpand, "top-left");
        // Add title to map
        mapView.ui.add(titleDiv.current, "top-right");

        const layer = new FeatureLayer({
          url:
            "https://services1.arcgis.com/F1v0ufATbBQScMtY/ArcGIS/rest/services/FireIncidents/FeatureServer/2",
          popupTemplate,
          // outFields: ["*"],
          outFields: [
            "LOCADDRESS",
            "ZIP",
            "zip",
            "alarmdate",
            "incidentnumber",
          ],
        });

        map.layers.add(layer);

        const layerView = await mapView.whenLayerView(layer);

        // set layerViewRef  = layerView to be able to filter layerView later
        layerViewRef.current = layerView;

        setLoading(false);
      }
    };

    init();
  }, []);

  const handleZipCode = (zipCode) => {
    layerViewRef.current.filter = {
      where: zipCode ? `ZIP = '${zipCode}'` : "1=1",
    };
  };

  return (
    <>
      {/* Filter */}
      <div className="esri-widget" ref={filterDiv}>
        <h4 className="filter-title">Zip Code</h4>
        <div onClick={() => handleZipCode(null)} className="filter-item">
          All
        </div>
        {zipCodeList?.map((zipCode) => (
          <div onClick={() => handleZipCode(zipCode)} className="filter-item">
            {zipCode}
          </div>
        ))}
      </div>

      {/* Title */}
      <div ref={titleDiv} class="esri-widget title-container">
        <h1 id="title-text">Las Vegas Fire Incidents</h1>
      </div>

      {/* Map */}
      <div className="mapDiv" ref={mapDiv}></div>
    </>
  );
};

export default ArcGisMap;
