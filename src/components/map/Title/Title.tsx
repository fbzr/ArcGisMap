import { RefObject } from "react";
import "./Title.css";

interface TitleProps {
  titleRef: RefObject<HTMLDivElement>;
}

const Title = ({ titleRef }: TitleProps) => {
  return (
    <div ref={titleRef} className="esri-widget title-container ">
      <h1 id="title-text">Las Vegas Fire Incidents</h1>
    </div>
  );
};

export default Title;
