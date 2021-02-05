import { RefObject } from "react";
// redux
import store from "../redux/store";
import {
  setMapLoaded,
  setSelectedZipCode,
  setTimeExtent,
} from "../redux/slices/map";
// esri
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import Expand from "@arcgis/core/widgets/Expand";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import TimeSlider from "@arcgis/core/widgets/TimeSlider";
import FeatureFilter from "@arcgis/core/views/layers/support/FeatureFilter";
import TimeInterval from "@arcgis/core/TimeInterval";
import TimeExtent from "@arcgis/core/TimeExtent";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import Geometry from "@arcgis/core/geometry/Geometry";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
// Config
import mapConfig from "./mapConfig";
//
import { format } from "date-fns";

interface InitParams {
  // object with dom references necessary for the map
  // [property: string]: RefObject<HTMLDivElement>;
  mapView: RefObject<HTMLDivElement>;
  title: RefObject<HTMLDivElement>;
  zipcodeExpandWidget: RefObject<HTMLDivElement>;
  timeSlider: RefObject<HTMLDivElement>;
}

class MapController {
  // ESRI
  #map?: Map;
  #mapView?: MapView;
  #fireFeatureLayer?: FeatureLayer;
  #zipcodeFeatureLayer?: FeatureLayer;
  #fireFeatureLayerView?: FeatureLayerView;
  #zipcodeFeatureLayerView?: FeatureLayerView;
  #graphicsLayer?: GraphicsLayer;

  // Other properties
  #zipCodeList: string[] = [];
  #startDate?: Date;
  #endDate?: Date;
  #selectedZipCode?: string;

  initialize = async (domRefs: InitParams) => {
    if (
      !domRefs.mapView.current ||
      !domRefs.zipcodeExpandWidget.current ||
      !domRefs.title.current ||
      !domRefs.timeSlider.current
    ) {
      return;
    }

    this.#fireFeatureLayer = new FeatureLayer(mapConfig.lvFireFeatureLayer);
    this.#zipcodeFeatureLayer = new FeatureLayer(mapConfig.zipcodeLayer);
    this.#graphicsLayer = new GraphicsLayer();

    this.#map = new Map({
      basemap: "topo-vector",
      layers: [
        this.#fireFeatureLayer,
        this.#zipcodeFeatureLayer,
        this.#graphicsLayer,
      ],
    });

    this.#mapView = new MapView({
      container: domRefs.mapView.current,
      map: this.#map,
    });

    // zipcode expand widget
    const zipcodeExpand = new Expand({
      view: this.#mapView,
      content: domRefs.zipcodeExpandWidget.current,
      expandIconClass: "esri-icon-filter",
      group: "top-left",
      autoCollapse: true,
    });

    const basemapGallery = new BasemapGallery({
      view: this.#mapView,
    });

    const basemapGalleryExpand = new Expand({
      view: this.#mapView,
      content: basemapGallery,
      expandIconClass: "esri-icon-basemap",
      autoCollapse: true,
    });

    this.#mapView.ui.add(basemapGalleryExpand, "top-left");
    this.#mapView?.ui.add(zipcodeExpand, "top-left");
    this.#mapView?.ui.add(domRefs.title.current, "top-right");

    if (this.#fireFeatureLayer && this.#zipcodeFeatureLayer) {
      this.#fireFeatureLayerView = await this.#mapView?.whenLayerView(
        this.#fireFeatureLayer
      );

      this.#zipcodeFeatureLayerView = await this.#mapView?.whenLayerView(
        this.#zipcodeFeatureLayer
      );

      await this.loadZipCodes();
      await this.createTimeSlider(domRefs.timeSlider.current);
      await this.updateFeaturesAndView();
      this.addSketchWidget();

      this.#mapView?.when(() => {
        store.dispatch(setMapLoaded(true));
      });
    }
  };

  private addSketchWidget = () => {
    const sketch = new Sketch({
      layer: this.#graphicsLayer,
      view: this.#mapView,
      availableCreateTools: ["polygon", "rectangle", "circle"],
      defaultCreateOptions: {
        mode: "freehand",
      },
      visibleElements: {
        selectionTools: {
          "rectangle-selection": false,
          "lasso-selection": false,
        },
      },
      // graphic will be selected as soon as it is created
      creationMode: "update",
    });

    sketch.on("create", async (event) => {
      if (event.state === "complete") {
        this.updateViews();
      }
    });

    sketch.on("delete", async (event) => {
      this.updateViews();
    });

    sketch.on("update", (event) => {
      if (event.state === "active" || event.state === "complete") {
        this.updateViews();
      }
    });

    this.#mapView?.ui.add(sketch, "bottom-right");
  };

  private uniteGraphicLayerGeometries = () => {
    let geometries = this.#graphicsLayer?.graphics.map(
      (graphic) => graphic.geometry
    );

    return geometries?.length
      ? geometryEngine.union(geometries.toArray())
      : undefined;
  };

  private getTimeExtentDate = async (date: "start" | "end") => {
    const res = await this.#fireFeatureLayer?.queryFeatures({
      outFields: ["alarmdate"],
      orderByFields: date === "start" ? ["alarmdate"] : ["alarmdate desc"],
      where: "1=1",
      num: 1, // return only one feature
    });

    const alarmdateRes: string = res?.features[0].attributes["alarmdate"];
    const alarmdate = new Date(alarmdateRes);

    const y = alarmdate.getUTCFullYear();
    const m = alarmdate.getMonth();

    // return first day of the month if date === "start" and last day if date === "end"
    return date === "start"
      ? new Date(y, m, 1, 0, 0, 0)
      : new Date(y, m + 1, 0, 23, 59, 59);
  };

  private createTimeSlider = async (timeSliderElement: HTMLDivElement) => {
    const labelFormatFunction = (
      value: Date | Date[],
      type: string | undefined,
      element: HTMLElement | undefined,
      layout: "compact" | "wide" | undefined
    ) => {
      switch (type) {
        case "min":
        case "max":
          if (value instanceof Date && element) {
            element.innerText = `${value.getFullYear()}`;
          }
          break;
        case "extent":
          if (value instanceof Array) {
            const start = value[0];
            const end = value[1];

            if (element) {
              element.innerHTML = `${format(start, "MMM/yyyy")} - ${format(
                end,
                "MMM/yyyy"
              )}`;
            }
          }
          break;
      }
    };

    const timeSlider = new TimeSlider({
      container: timeSliderElement,
      view: this.#mapView,
      stops: {
        interval: new TimeInterval({
          value: 1,
          unit: "months",
        }),
      },
      playRate: 120,
      labelFormatFunction,
    });

    this.#startDate = await this.getTimeExtentDate("start");
    this.#endDate = await this.getTimeExtentDate("end");
    store.dispatch(
      setTimeExtent({
        start: this.#startDate,
        end: this.#endDate,
      })
    );

    timeSlider.fullTimeExtent = new TimeExtent({
      start: this.#startDate,
      end: this.#endDate,
    });

    // set initial time slider range to full range
    timeSlider.values = [this.#startDate, this.#endDate];

    timeSlider.watch("timeExtent", async () => {
      // update start and end dates
      this.#startDate = timeSlider.timeExtent.start;
      this.#endDate = timeSlider.timeExtent.end;
      store.dispatch(
        setTimeExtent({ start: this.#startDate, end: this.#endDate })
      );

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

    const timeSliderExpand = new Expand({
      view: this.#mapView,
      content: timeSliderElement,
      expandIconClass: "esri-icon-time-clock",
    });

    this.#mapView?.ui.add(timeSliderExpand, "bottom-left");
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

  private centerMap = async (features: __esri.Graphic[]) => {
    const geometries: Geometry[] = features.map((feature) => feature.geometry);

    this.#mapView?.goTo(geometries);
  };

  private updateFeatures = async () => {
    if (this.#startDate && this.#endDate) {
      const fireLayerWhere = `alarmdate >= '${this.getQueryDateFormat(
        this.#startDate
      )}' AND alarmdate <= '${this.getQueryDateFormat(this.#endDate)}'`;

      const fireFeaturesResponse = await this.#fireFeatureLayer?.queryFeatures({
        where: fireLayerWhere,
        returnGeometry: !this.#selectedZipCode,
        outSpatialReference: this.#mapView?.spatialReference,
      });

      const zipcodeFeaturesResponse = await this.#zipcodeFeatureLayer?.queryFeatures(
        {
          where: this.#selectedZipCode
            ? `ZIP = '${this.#selectedZipCode}'`
            : "1=1",
          returnGeometry: !!this.#selectedZipCode,
          outSpatialReference: this.#mapView?.spatialReference,
        }
      );

      if (zipcodeFeaturesResponse && fireFeaturesResponse) {
        // if zipcode is selected map is centered based on zipcode
        // if not it's centered based on all fire features
        const features = this.#selectedZipCode
          ? zipcodeFeaturesResponse.features
          : fireFeaturesResponse.features;
        this.centerMap(features);
      }
    }
  };

  private updateViews = async () => {
    // Fire layer view
    if (this.#fireFeatureLayerView) {
      let fireLayerWhere: string = `alarmdate >= ${this.#startDate?.getTime()} AND alarmdate <= ${this.#endDate?.getTime()}`;
      let graphicLayerGeometry = this.uniteGraphicLayerGeometries();

      if (this.#selectedZipCode) {
        fireLayerWhere += ` AND (ZIP = '${
          this.#selectedZipCode
        }' OR postalcode = ${this.#selectedZipCode})`;
      }

      this.#fireFeatureLayerView.filter = new FeatureFilter({
        where: fireLayerWhere,
        geometry: graphicLayerGeometry,
      });
    }

    // Zipcode layer view
    if (this.#zipcodeFeatureLayerView) {
      this.#zipcodeFeatureLayerView.filter = new FeatureFilter({
        where: `ZIP = '${this.#selectedZipCode}'`,
      });

      this.#zipcodeFeatureLayerView.visible = !!this.#selectedZipCode;
    }
  };

  updateFeaturesAndView = async (zipCode: string | null = null) => {
    if (this.#fireFeatureLayerView && this.#zipcodeFeatureLayerView) {
      this.#selectedZipCode = zipCode ?? undefined;

      if (this.#selectedZipCode) {
        this.#graphicsLayer?.removeAll();
      }

      store.dispatch(setSelectedZipCode(this.#selectedZipCode));

      await this.updateFeatures();
      await this.updateViews();
    }
  };

  private getQueryDateFormat(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  public get zipCodeList(): string[] {
    return this.#zipCodeList;
  }
}

const mapController = new MapController();

export default mapController;
