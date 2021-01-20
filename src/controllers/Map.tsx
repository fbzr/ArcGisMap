import { RefObject } from "react";
import { setDefaultOptions, loadModules } from "esri-loader";
import mapConfig from "./mapConfig";

setDefaultOptions({ css: true });

interface InitParams {
  // object with dom references necessary for the map
  [property: string]: RefObject<HTMLDivElement>;
}

class MapController {
  // ESRI
  #map?: __esri.Map;
  #mapView?: __esri.MapView;
  #featureLayer?: __esri.FeatureLayer;
  #featureLayerView?: __esri.FeatureLayerView;

  // Other properties
  #zipCodeList: string[] = [];

  initialize = async (domRefs: InitParams) => {
    if (!domRefs.mapView.current) return;

    const [Map, MapView, FeatureLayer, Expand] = await loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/FeatureLayer",
      "esri/widgets/Expand",
    ]);

    this.#map = new Map({ basemap: "topo-vector" });

    this.#mapView = new MapView({
      container: domRefs.mapView.current,
      map: this.#map,
    });

    this.#featureLayer = new FeatureLayer(mapConfig.featureLayer);

    // expand widget
    const expand = new Expand({
      view: this.#mapView,
      content: domRefs.expand.current,
      expandIconClass: "esri-icon-filter",
      group: "top-left",
    });

    this.#mapView?.ui.add(expand, "top-left");
    if (domRefs.title) {
      this.#mapView?.ui.add(
        domRefs.title.current as HTMLDivElement,
        "top-right"
      );
    }

    this.#map?.layers.add(this.#featureLayer as __esri.Layer);

    this.#featureLayerView = await this.#mapView?.whenLayerView(
      this.#featureLayer as __esri.FeatureLayer
    );

    await this.loadZipCodes();
    await this.updateFeaturesAndView();
  };

  private loadZipCodes = async () => {
    // get distinct zip code values
    const { features } = (await this.#featureLayer?.queryFeatures({
      returnDistinctValues: true,
      outFields: ["ZIP"],
      where: "ZIP IS NOT NULL AND ZIP <> ''",
      orderByFields: ["ZIP"],
    })) as __esri.FeatureSet;

    this.#zipCodeList = features.map((feature) => feature.attributes["ZIP"]);
  };

  updateFeaturesAndView = async (zipCode: string | null = null) => {
    const where = zipCode ? `ZIP = '${zipCode}'` : "1=1";

    if (this.#featureLayerView) {
      this.#featureLayerView.filter = {
        where,
      } as __esri.FeatureFilter;
    }

    const { features } = (await this.#featureLayer?.queryFeatures({
      where,
      returnGeometry: true,
      outSpatialReference: this.#mapView?.spatialReference,
    })) as __esri.FeatureSet;

    const geometries: __esri.Geometry[] = features.map(
      (feature) => feature.geometry
    );

    this.#mapView?.goTo(geometries);
  };

  public get zipCodeList(): string[] {
    return this.#zipCodeList;
  }
}

const mapController = new MapController();

export default mapController;
