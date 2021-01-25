import { RefObject } from "react";
import "./Title.css";
// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface TitleProps {
  titleRef: RefObject<HTMLDivElement>;
}

const Title = ({ titleRef }: TitleProps) => {
  const { selectedZipCode } = useSelector((state: RootState) => state.map);

  return (
    <div ref={titleRef} className="esri-widget title-container ">
      <h1 id="title-text">Las Vegas Fire Incidents</h1>
      <h2>{selectedZipCode}</h2>
    </div>
  );
};

export default Title;
