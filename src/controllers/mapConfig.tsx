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

const featureLayer = {
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
};

const mapConfig = {
  featureLayer,
};

export default mapConfig;
