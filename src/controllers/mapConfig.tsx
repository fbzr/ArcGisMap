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
          fieldName: "Alarmdate",
          label: "Alarm Date",
        },
        {
          fieldName: "incidentnumber",
          label: "Incident #",
        },
      ],
    },
  ],
};

const lvFireFeatureLayer = {
  url:
    "https://services1.arcgis.com/F1v0ufATbBQScMtY/ArcGIS/rest/services/FireIncidents/FeatureServer/2",
  popupTemplate,
  outFields: [
    "LOCADDRESS",
    "ZIP",
    "zip",
    "alarmdate",
    "incidentnumber",
    "latitude",
    "longitude",
  ],
};

const zipcodeLayer = {
  url:
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_ZIP_Codes_2014/FeatureServer/0",
  outFields: ["ZIP"],
  visible: false,
  renderer: {
    type: "simple",
    symbol: {
      type: "simple-fill",
      color: [0, 121, 193, 0.1],
      outline: {
        width: 1,
        color: [0, 0, 0, 0.3],
      },
    },
  },
};

const mapConfig = {
  lvFireFeatureLayer,
  zipcodeLayer,
};

export default mapConfig;
