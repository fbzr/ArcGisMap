import { RefObject } from "react";
import { setDefaultOptions, loadModules } from "esri-loader";
import mapConfig from "./mapConfig";

setDefaultOptions({ css: true });

interface InitParams {
  // object with dom references necessary for the map
  // [property: string]: RefObject<HTMLDivElement>;
  mapView: RefObject<HTMLDivElement>;
  expand: RefObject<HTMLDivElement>;
  timeSlider: RefObject<HTMLDivElement>;
  title: RefObject<HTMLDivElement>;
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

    this.#map?.layers.add(this.#featureLayer as __esri.Layer);

    this.#featureLayerView = await this.#mapView?.whenLayerView(
      this.#featureLayer as __esri.FeatureLayer
    );

    // expand widget
    const expand = new Expand({
      view: this.#mapView,
      content: domRefs.expand.current,
      expandIconClass: "esri-icon-filter",
      group: "top-left",
    });

    this.#mapView?.ui.add(expand, "top-left");

    if (domRefs.title.current) {
      this.#mapView?.ui.add(domRefs.title.current, "top-right");
    }
    this.#map?.layers.add(this.#featureLayer as __esri.FeatureLayer);

    await this.loadZipCodes();
    await this.updateFeaturesAndView();
    await this.loadTimeSlider(domRefs.timeSlider);
  };

  private loadTimeSlider = async (timeSliderRef: RefObject<HTMLDivElement>) => {
    const [TimeSlider, FeatureFilter] = await loadModules([
      "esri/widgets/TimeSlider",
      "esri/views/layers/support/FeatureFilter",
    ]);

    const timeSlider = new TimeSlider({
      container: timeSliderRef.current,
      view: this.#mapView,
      stops: {
        interval: {
          value: 1,
          unit: "months",
        },
      },
    });

    this.#mapView?.ui.add(timeSlider, "bottom-left");

    // TODO: set start and end dynamicaly
    // start time of the time slider
    const start = new Date(1992, 0, 1);
    timeSlider.fullTimeExtent = {
      start,
      end: new Date(),
      // end: this.#featureLayer?.timeInfo.fullTimeExtent.end,
    } as __esri.TimeExtent;

    timeSlider.watch("timeExtent", () => {
      if (this.#featureLayerView) {
        const layerView = this.#featureLayerView;

        layerView.filter = new FeatureFilter({
          where: `alarmdate >= ${timeSlider.timeExtent.start.getTime()} AND alarmdate <= ${timeSlider.timeExtent.end.getTime()}`,
        });
      }
    });

    this.#mapView?.ui.add(timeSlider, "bottom-left");
  };

  private loadZipCodes = async () => {
    // get distinct zip code values
    const featureRes = await this.#featureLayer?.queryFeatures({
      returnDistinctValues: true,
      outFields: ["ZIP"],
      where: "ZIP IS NOT NULL AND ZIP <> ''",
      orderByFields: ["ZIP"],
    });

    if (featureRes?.features) {
      this.#zipCodeList = featureRes?.features?.map(
        (feature) => feature.attributes["ZIP"]
      );
    }
  };

  updateFeaturesAndView = async (zipCode: string | null = null) => {
    const where = zipCode ? `ZIP = '${zipCode}'` : "1=1";

    if (this.#featureLayerView) {
      this.#featureLayerView.filter = {
        where,
      } as __esri.FeatureFilter;
    }

    const featureRes = await this.#featureLayer?.queryFeatures({
      where,
      returnGeometry: true,
      outSpatialReference: this.#mapView?.spatialReference,
    });

    if (featureRes?.features) {
      const geometries: __esri.Geometry[] = featureRes?.features.map(
        (feature) => feature.geometry
      );

      this.#mapView?.goTo(geometries);
    }
  };

  public get zipCodeList(): string[] {
    return this.#zipCodeList;
  }
}

const mapController = new MapController();

export default mapController;
