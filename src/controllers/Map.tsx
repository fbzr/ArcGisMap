import { RefObject } from "react";
import { setDefaultOptions, loadModules } from "esri-loader";

class MapController {
  #map?: __esri.Map;
  #mapView?: __esri.MapView;

  initialize = async (domRef: RefObject<HTMLDivElement>) => {
    if (!domRef.current) return;

    const [Map, MapView] = await loadModules([
      "esri/Map",
      "esri/views/MapView",
    ]);

    this.#map = new Map({ basemap: "topo-vector" });

    this.#mapView = new MapView({
      container: domRef.current,
      map: this.#map,
      center: [-115.1398, 36.1699], // Sets the center point of the view at a specified lon/lat - Las Vegas: 36.1699° N, 115.1398° W
      zoom: 12,
    });
  };
}

const mapController = new MapController();

export default mapController;
