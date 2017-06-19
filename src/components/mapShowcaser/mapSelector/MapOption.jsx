import React from 'react';
import PropTypes from 'prop-types';
import './MapOption.styl';

function MapOption(props) {
  const { handleChoice, chosen, title, description,
          imgUrl, optionId, optionData } = props;
  const hClick = () => {
    if (!chosen) {
      handleChoice(optionId, optionData);
    }
  };

  let chosenClass;
  if (chosen) {
    chosenClass = 'chosen';
  } else {
    chosenClass = 'notChosen';
  }

  return (
    <button className={`mapOption mapOption-${chosenClass}`} onClick={hClick} >
      <div className="mapOption-info">
        <div className="mapOption-title-container">
          {title}
        </div>
        <div className="mapOption-underline-container">
          <div className="mapOption-underline" />
        </div>
        <div className="mapOption-description-container">
          {description}
        </div>
      </div>
      <img className="mapOption-image" src={imgUrl} alt={title} />
    </button>
  );
}

MapOption.propTypes = {
  handleChoice: PropTypes.func.isRequired,
  chosen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imgUrl: PropTypes.string.isRequired,
  optionId: PropTypes.string.isRequired,
  optionData: PropTypes.object.isRequired,
};

export default MapOption;