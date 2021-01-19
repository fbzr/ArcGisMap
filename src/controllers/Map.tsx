import { RefObject } from "react";
import { setDefaultOptions, loadModules } from "esri-loader";

class MapController {
  #map?: __esri.Map;
  #mapView?: __esri.MapView;
  #featureLayer?: __esri.FeatureLayer;

  initialize = async (domRef: RefObject<HTMLDivElement>) => {
    if (!domRef.current) return;

    const [Map, MapView, FeatureLayer] = await loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
    ]);

    this.#map = new Map({ basemap: "topo-vector" });

    this.#mapView = new MapView({
      container: domRef.current,
      map: this.#map,
      center: [-115.1398, 36.1699], // Sets the center point of the view at a specified lon/lat - Las Vegas: 36.1699° N, 115.1398° W
      zoom: 12,
    });

    this.#featureLayer = new FeatureLayer({
      url:
        "https://services1.arcgis.com/F1v0ufATbBQScMtY/ArcGIS/rest/services/FireIncidents/FeatureServer/2",
      // popupTemplate,
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

    this.#map?.layers.add(this.#featureLayer as __esri.Layer);
  };
}

const mapController = new MapController();

export default mapController;
