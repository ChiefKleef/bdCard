import './VisualizationSection.styl';
import React from 'react';
import Visualizer from './Visualizer.jsx';
import { guid } from '../../../../utils/generalUtils.jsx';
import { convertPropsMetadataToDrodownObject } from '../analysisUtils.jsx';
import { constructVisEventData, visEventsAreDifferent } from './visUtils.jsx';
// eventually bring in constructVisEventData & visEventsAreDifferent

// consider https://www.npmjs.com/package/react-color

// VISUALIZER MEMORY
var memory = {
  visSetting: {},
  lastVisEventData: null,
  firstDraw: true
};

class VisualizationSection extends React.Component {
  constructor(props){
    super();
    this.dropdownData = Object.assign({}, convertPropsMetadataToDrodownObject(props.propsMd));
    this.id = guid();
    this.updateVisSettingMemory = this.updateVisSettingMemory.bind(this);
  }

  updateActiveFields(){
    window.activeFields = {}
    const fieldLabel = memory.visSetting.fieldLabel;
    const yearLabel = memory.visSetting.yearLabel;
    const propLabel = fieldLabel + ' ' + yearLabel;
    const selectedProp = memory.visSetting.selectedProp;
    window.activeFields[selectedProp] = propLabel;
  };

  updateVisSettingMemory(visId, visState){
    memory.visSetting = visState;
    if (memory.firstDraw){
      memory.firstDraw = false;
      return;
    }
    if ( !visState.freezeVisValidity ) {
      this.determineVisEventFire();
    }
    this.updateActiveFields();
  }

  determineVisEventFire(){
    const visEventData = constructVisEventData(memory.visSetting);
    if (!memory.visSetting.visActive && (memory.visSetting.visActive !== memory.lastVisEventData.visActive)){
      const unvisualize = new CustomEvent('UNVISUALIZE')
      document.dispatchEvent(unvisualize);
    } else if (visEventsAreDifferent(memory.lastVisEventData, visEventData) && memory.visSetting.visActive){
      const visualize = new CustomEvent('VISUALIZE', {'detail': visEventData})
      document.dispatchEvent(visualize);
    }
    memory.lastVisEventData = visEventData;
  }

  render() {
    return (
      <div className="visualizationSection section">
        <div className='header'>
          <span className='header-title'>
            Visualization Settings<span className='fa fa-paint-brush'/>
          </span>
        </div>
        <div className='visContainer'>
          <Visualizer id={this.id} memory={memory.visSetting} dropdownData={this.dropdownData} updateVisSettingMemory={this.updateVisSettingMemory} propsMd={this.props.propsMd} />
        </div>
      </div>
    );
  }
}

 export default VisualizationSection;
