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
  timeInfo: {
    startField: "alarmdate",
    interval: {
      // set time interval to one year
      unit: "years",
      value: 1,
    },
  },
  // timeExtent is automatically calculated from the
  // the start and end date fields
  // timeExtent: {
  //   start: new Date(1989, 1, 1),
  //   end: new Date(2021, 1, 1),
  // },x
};

const mapConfig = {
  featureLayer,
};

export default mapConfig;
