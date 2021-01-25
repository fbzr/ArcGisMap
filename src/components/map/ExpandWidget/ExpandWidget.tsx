import { RefObject } from "react";
import mapController from "../../../controllers/Map";
// CSS
import "./ExpandWidget.css";

interface ExpandWidgetProps {
  // TODO: fetch from redux store
  loading: boolean;
  expandWidgetRef: RefObject<HTMLDivElement>;
}

const ExpandWidget = (props: ExpandWidgetProps) => {
  const { loading, expandWidgetRef } = props;

  const handleClick = async (
    event: React.MouseEvent<HTMLDivElement> | null
  ) => {
    await mapController.updateFeaturesAndView(
      event ? event.currentTarget.innerText : null
    );
  };

  return (
    <div className="esri-widgets filter-container" ref={expandWidgetRef}>
      {!loading && (
        <>
          <h4 className="filter-title">Zip Code</h4>
          <div onClick={() => handleClick(null)} className="filter-item">
            All
          </div>
          {mapController.zipCodeList?.map((zipCode) => (
            <div
              key={`${zipCode}`}
              onClick={handleClick}
              className="filter-item"
            >
              {zipCode}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ExpandWidget;
