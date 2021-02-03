import { RefObject } from "react";
import "./Title.scss";
// Redux
import { useSelector } from "react-redux";
import { selectedZipCode as selectedZipCodeSelector } from "../../../redux/slices/map";

interface TitleProps {
  titleRef: RefObject<HTMLDivElement>;
}

const Title = ({ titleRef }: TitleProps) => {
  const selectedZipCode = useSelector(selectedZipCodeSelector);

  return (
    <div ref={titleRef} className="esri-widget title-container ">
      <h1 id="title-text">Las Vegas Fire Incidents</h1>
      <h2>{selectedZipCode}</h2>
    </div>
  );
};

export default Title;
