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
  #fireFeatureLayer?: __esri.FeatureLayer;
  #zipcodeFeatureLayer?: __esri.FeatureLayer;
  #fireFeatureLayerView?: __esri.FeatureLayerView;
  #zipcodeFeatureLayerView?: __esri.FeatureLayerView;

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

    this.#fireFeatureLayer = new FeatureLayer(mapConfig.lvFireFeatureLayer);
    this.#zipcodeFeatureLayer = new FeatureLayer(mapConfig.zipcodeLayer);

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

    if (this.#fireFeatureLayer && this.#zipcodeFeatureLayer) {
      this.#map?.layers.addMany([
        this.#zipcodeFeatureLayer,
        this.#fireFeatureLayer,
      ]);

      this.#fireFeatureLayerView = await this.#mapView?.whenLayerView(
        this.#fireFeatureLayer
      );

      this.#zipcodeFeatureLayerView = await this.#mapView?.whenLayerView(
        this.#zipcodeFeatureLayer
      );

      await this.loadZipCodes();
      await this.createTimeSlider(domRefs.timeSlider);
      await this.updateFeaturesAndView();
    }
  };

  private getTimeExtentDate = async (date: "start" | "end") => {
    const res = await this.#fireFeatureLayer?.queryFeatures({
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

    const labelFormatFunction = (
      value: Date | Date[],
      type: string,
      element: HTMLElement,
      layout: "compact" | "wide"
    ) => {
      switch (type) {
        case "min":
        case "max":
          if (value instanceof Date) {
            element.innerText = `${value.getFullYear()}`;
          }
          break;
        case "extent":
          if (value instanceof Array) {
            const start = value[0];
            let startMonth =
              start.getMonth() + 1 < 10
                ? `0${start.getMonth() + 1}`
                : start.getMonth() + 1;
            const end = value[1];
            let endMonth =
              end.getMonth() + 1 < 10
                ? `0${end.getMonth() + 1}`
                : end.getMonth() + 1;

            element.innerText = `${startMonth}/${start.getFullYear()} - ${endMonth}/${end.getFullYear()}`;
          }
          break;
      }
    };

    const timeSlider = new TimeSlider({
      container: timeSliderRef.current,
      view: this.#mapView,
      stops: {
        interval: {
          value: 1,
          unit: "months",
        },
      },
      playRate: 120,
      labelFormatFunction,
    });

    this.#startDate = await this.getTimeExtentDate("start");
    this.#endDate = await this.getTimeExtentDate("end");

    timeSlider.fullTimeExtent = {
      start: this.#startDate,
      end: this.#endDate,
    };

    // set initial time slider range to full range
    timeSlider.values = [this.#startDate, this.#endDate];

    timeSlider.watch("timeExtent", async () => {
      // update start and end dates
      this.#startDate = timeSlider.timeExtent.start;
      this.#endDate = timeSlider.timeExtent.end;

      if (this.#fireFeatureLayerView) {
        let where = `alarmdate >= ${timeSlider.timeExtent.start.getTime()} AND alarmdate <= ${timeSlider.timeExtent.end.getTime()}`;

        if (this.#selectedZipCode) {
          where += ` AND (ZIP = '${this.#selectedZipCode}' OR postalcode = ${
            this.#selectedZipCode
          })`;
        }

        this.#fireFeatureLayerView.filter = new FeatureFilter({
          where,
        });
      }
    });

    this.#mapView?.ui.add(timeSlider, "bottom-left");
  };

  private loadZipCodes = async () => {
    // get distinct zip code values
    const featureRes = await this.#fireFeatureLayer?.queryFeatures({
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
    const [FeatureFilter] = await loadModules([
      "esri/views/layers/support/FeatureFilter",
    ]);

    if (this.#fireFeatureLayerView && this.#zipcodeFeatureLayerView) {
      const fireLayerView = this.#fireFeatureLayerView;
      const zipcodeLayerView = this.#zipcodeFeatureLayerView;

      let where: string = "1=1";

      if (this.#startDate && this.#endDate) {
        where = `alarmdate >= ${this.#startDate.getTime()} AND alarmdate <= ${this.#endDate.getTime()}`;
      }

      this.#selectedZipCode = zipCode ?? undefined;

      if (this.#selectedZipCode) {
        where += ` AND (ZIP = '${this.#selectedZipCode}' OR postalcode = ${
          this.#selectedZipCode
        })`;

        zipcodeLayerView.filter = new FeatureFilter({
          where: `ZIP = '${this.#selectedZipCode}'`,
        });
      }

      zipcodeLayerView.visible = !!this.#selectedZipCode;

      fireLayerView.filter = new FeatureFilter({
        where,
      });

      where = zipCode
        ? `(ZIP = '${zipCode}' OR postalcode = ${zipCode})`
        : "1=1";

      const featureRes = await this.#fireFeatureLayer?.queryFeatures({
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
    }
  };

  public get zipCodeList(): string[] {
    return this.#zipCodeList;
  }
}

const mapController = new MapController();

export default mapController;
