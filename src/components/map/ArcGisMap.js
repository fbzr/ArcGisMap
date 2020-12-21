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
  const layerRef = useRef(null);
  const viewRef = useRef(null);

  // const [view, setView] = useState(null);
  const [filterList, setFilterList] = useState(null);
  const [loading, setLoading] = useState(true);

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
            "latitude",
            "longitude",
          ],
        });

        layerRef.current = layer;

        const { features } = await layer.queryFeatures();
        const zipCodeSet = new Set();

        // create list of filter objects with zip code, longitude and latitude
        const list = features.reduce((currentList, feature) => {
          const zipCode = feature?.attributes?.ZIP;
          if (zipCode && !zipCodeSet.has(zipCode)) {
            const latitude = feature?.attributes?.latitude;
            const longitude = feature?.attributes?.longitude;
            currentList.push({ zipCode, latitude, longitude });

            zipCodeSet.add(zipCode);
          }
          return currentList;
        }, []);

        setFilterList(list);

        map.layers.add(layer);

        const layerView = await mapView.whenLayerView(layer);

        // set layerViewRef  = layerView to be able to filter layerView later
        layerViewRef.current = layerView;

        setLoading(false);
        viewRef.current = mapView;
      }
    };

    init();
  }, []);

  const handleFilter = async (filter) => {
    const where = filter ? `ZIP = '${filter.zipCode}'` : "1=1";

    const { features } = await layerRef.current.queryFeatures({
      where,
      f: "json",
      returnGeometry: true,
      outSpatialReference: viewRef.current.spatialReference,
    });

    debugger;

    layerViewRef.current.filter = {
      where,
    };

    const geometries = features.map((feature) => feature.geometry);

    viewRef.current.goTo(geometries);
  };

  return (
    <>
      {/* Filter */}
      <div className="esri-widgets filter-container" ref={filterDiv}>
        <h4 className="filter-title">Zip Code</h4>
        <div onClick={() => handleFilter(null)} className="filter-item">
          All
        </div>
        {filterList?.map((filter) => (
          <div
            key={`${filter.zipCode}${filter.latitude}${filter.longitude}`}
            onClick={() => handleFilter(filter)}
            className="filter-item"
          >
            {filter.zipCode}
          </div>
        ))}
      </div>

      {/* Title */}
      <div ref={titleDiv} className="esri-widget title-container ">
        <h1 id="title-text">Las Vegas Fire Incidents</h1>
      </div>

      {/* Map */}
      <div className="mapDiv" ref={mapDiv}></div>
    </>
  );
};

export default ArcGisMap;
