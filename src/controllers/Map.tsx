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

  // Other properties
  #zipCodeList: string[] = [];
  #startDate?: Date;
  #endDate?: Date;
  #selectedZipCode?: string;

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
    await this.createTimeSlider(domRefs.timeSlider);
  };

  private getTimeExtentDate = async (date: "start" | "end") => {
    const res = await this.#featureLayer?.queryFeatures({
      outFields: ["alarmdate"],
      orderByFields: date === "start" ? ["alarmdate"] : ["alarmdate desc"],
      where: "1=1",
      num: 1, // return only one feature
    });

    const alarmdate = res?.features[0].attributes["alarmdate"];
    return new Date(alarmdate);
  };

  private createTimeSlider = async (
    timeSliderRef: RefObject<HTMLDivElement>
  ) => {
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
      playRate: 80,
    });

    this.#startDate = await this.getTimeExtentDate("start");
    this.#endDate = await this.getTimeExtentDate("end");

    timeSlider.fullTimeExtent = {
      start: this.#startDate,
      end: this.#endDate,
    } as __esri.TimeExtent;

    // set initial time slider range to full range
    timeSlider.values = [this.#startDate, this.#endDate];

    timeSlider.watch("timeExtent", async () => {
      if (this.#featureLayer) {
        const layerView = await this.#mapView?.whenLayerView(
          this.#featureLayer
        );

        if (layerView) {
          layerView.filter = new FeatureFilter({
            where: `alarmdate >= ${timeSlider.timeExtent.start.getTime()} AND alarmdate <= ${timeSlider.timeExtent.end.getTime()}`,
          });
        }
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
    if (zipCode) {
      this.#selectedZipCode = zipCode;
    }

    const layerView = await this.#mapView?.whenLayerView(
      this.#featureLayer as __esri.FeatureLayer
    );

    // TODO: add startdate and enddate to query
    const where = zipCode
      ? `ZIP = '${zipCode}' OR postalcode = ${zipCode}`
      : "1=1";

    if (layerView) {
      layerView.filter = {
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
