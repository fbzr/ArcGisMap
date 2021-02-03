import { RefObject } from "react";
import mapController from "../../../controllers/Map";
// CSS
import "./ExpandWidget.scss";
// Redux
import { useSelector } from "react-redux";
import { mapLoaded as mapLoadedSelector } from "../../../redux/slices/map";

interface ExpandWidgetProps {
  // TODO: fetch from redux store
  expandWidgetRef: RefObject<HTMLDivElement>;
}

const ExpandWidget = (props: ExpandWidgetProps) => {
  const { expandWidgetRef } = props;
  const mapLoaded = useSelector(mapLoadedSelector);

  const handleClick = async (
    event: React.MouseEvent<HTMLDivElement> | null
  ) => {
    await mapController.updateFeaturesAndView(
      event ? event.currentTarget.innerText : null
    );
  };

  return (
    <div className="esri-widgets filter-container" ref={expandWidgetRef}>
      <h4 className="filter-title">Zip Code</h4>
      <div onClick={() => handleClick(null)} className="filter-item">
        All
      </div>

      {mapLoaded &&
        mapController.zipCodeList?.map((zipCode) => (
          <div key={`${zipCode}`} onClick={handleClick} className="filter-item">
            {zipCode}
          </div>
        ))}
    </div>
  );
};

export default ExpandWidget;
