import { RefObject } from "react";
import "./Title.scss";
// Redux
import { useSelector } from "react-redux";
import {
  selectedZipCode as selectedZipCodeSelector,
  timeExtent as timeExtentSelector,
} from "../../../redux/slices/map";
//
import { format } from "date-fns";

interface TitleProps {
  titleRef: RefObject<HTMLDivElement>;
}

const Title = ({ titleRef }: TitleProps) => {
  const selectedZipCode = useSelector(selectedZipCodeSelector);
  const { startDate, endDate } = useSelector(timeExtentSelector);

  return (
    <div ref={titleRef} className="esri-widget title-container ">
      <h1 id="title-text">Las Vegas Fire Incidents</h1>
      {startDate && endDate && (
        <h2>
          {selectedZipCode && `${selectedZipCode} - `}
          {`${format(startDate, "MMM/yyyy")} - ${format(endDate, "MMM/yyyy")}`}
        </h2>
      )}
    </div>
  );
};

export default Title;
