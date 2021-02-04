import { RefObject } from "react";
import "./Title.scss";
// Redux
import { useSelector } from "react-redux";
import {
  selectedZipCode as selectedZipCodeSelector,
  startDate as startDateSelector,
  endDate as endDateSelector,
} from "../../../redux/slices/map";

interface TitleProps {
  titleRef: RefObject<HTMLDivElement>;
}

const Title = ({ titleRef }: TitleProps) => {
  const selectedZipCode = useSelector(selectedZipCodeSelector);
  const startDate = useSelector(startDateSelector);
  const endDate = useSelector(endDateSelector);

  return (
    <div ref={titleRef} className="esri-widget title-container ">
      <h1 id="title-text">Las Vegas Fire Incidents</h1>
      <h2>
        {selectedZipCode} - {startDate?.toString()} - {endDate?.toString()}
      </h2>
    </div>
  );
};

export default Title;
