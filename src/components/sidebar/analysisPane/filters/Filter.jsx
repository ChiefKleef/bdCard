import './Filter.styl';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import ActiveSlider from '../commonComponents/ActiveSlider.jsx';
import Select from 'react-select';
import 'rc-slider/assets/index.css';
const Slider = require('rc-slider');
const Range = Slider.Range;

import { choseFormatter } from '../../../../utils/unitFormatters.jsx';

import { isSubRange, validateAndNormalizeRangeInputValue, fieldUnitAndRangeHandler, determineNewSelectedRange } from '../analysisUtils.jsx';

//// IMPORTANT NOTES
// 1) This component is only currently capable of handling integers, thus all min/max values coming in are floored/ceiled accordingly

class Filter extends React.Component {
  constructor(props){
    super();
    //// CREATE THE DEFAULT STATE
    // DETERMINE UNITS AND FORMATTERS
    // consider removing the propsMD from the props and only including it in the utils;

    // SET THE LOOKUPS
    this.yearLookups = props.dropdownData.yearLookups;
    this.propRegistry = props.dropdownData.dropdownPropRegistry;

    //// LOAD STATE FROM MEMORY
    if (props.memory === undefined){
      const fieldOptions = props.dropdownData.fieldDropdowns;
      
      const defaultFieldVal = fieldOptions[props.defaultFieldIndex].value;
      const defaultFieldLabel = fieldOptions[props.defaultFieldIndex].label;
      const defaultYearOptions = this.yearLookups[defaultFieldVal];
      const defaultYearVal = defaultYearOptions[0].value;
      
      const defaultSelectedProp = this.propRegistry[defaultFieldVal + defaultYearVal];

       
      var { min, max, median, units } = fieldUnitAndRangeHandler(defaultSelectedProp, props.propsMd);
      const { unitFormatter } = choseFormatter(units);
      var medianLabel = 'median: ' + unitFormatter(median);
      var medianMark = {};
      medianMark[median] = medianLabel;

      // SET THE DEFAULT STATE
      const defaultFilterSetting = {
        filterActive: true,
        
        selectedProp: defaultSelectedProp,
        
        fieldValue: defaultFieldVal,
        fieldLabel: defaultFieldLabel,
        fieldOptions: fieldOptions,
        yearValue: defaultYearVal,
        yearOptions: defaultYearOptions,

        filterValid: false,
        freezeFilterValidity: false,
        alertSliderOfRedefinition: false,

        range: [min, max],
        selectedRange: [min, max],
        medianMark: medianMark,
        units: units,
        rangeMinInputActive: false,
        rangeMaxInputActive: false,
        rangeInputValue: ''
      }
      this.state = defaultFilterSetting;
    } else {
      this.state = props.memory;  
    }
    //// HANDLER BINDINGS
    this.handleFilterActiveToggle = this.handleFilterActiveToggle.bind(this);
    this.handleRemoveFilter = this.handleRemoveFilter.bind(this);
    this.handleFieldSelection = this.handleFieldSelection.bind(this);
    this.handleYearSelection = this.handleYearSelection.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.handleSliderAfterChange = this.handleSliderAfterChange.bind(this);
    this.handleRangeInputFocus = this.handleRangeInputFocus.bind(this);
    this.handleRangeInputBlur = this.handleRangeInputBlur.bind(this);
    this.handleRangeInputChange = this.handleRangeInputChange.bind(this);
    this.handleRangeInputKeydown = this.handleRangeInputKeydown.bind(this);

    // document.addEventListener('REDRAW_COMPLETE');
  }

  componentDidMount(){
    var style = document.getElementById(this.props.id).style;
    style.right = '0px';
    this.props.updateFilterSettingsMemory(this.props.id, this.state);
  }

  componentDidUpdate(){
    this.props.updateFilterSettingsMemory(this.props.id, this.state);
  }

  //// REMOVE FILTER HANDLER

  handleRemoveFilter(e){
    // scrape filter ID from the remove filter button id
    // this is probably not necessary anymore, was doing this during troubleshooting of a different issue
    var style = document.getElementById(this.props.id).style;
    style.visibility = 'hidden';
    const filterId = e.target.id.slice(e.target.id.indexOf('-') + 1);
    this.props.handleRemoveFilter(filterId);
  }

  //// FIELD ACTIVE TOGGLER HANDLERS

  handleFilterActiveToggle(){
    this.setState({
      filterActive: !this.state.filterActive
    });
  }

  //// FIELD SELECTION HANDLERS

  handleFieldSelection(val){
    const fieldVal = val.value;
    const fieldLabel = val.label;

    const { yearValue, selectedRange } = this.state;
    // need to refactor terminology to var, newVar for everything
    const oldUnits = this.state.units;

    const defaultYearOptions = this.yearLookups[fieldVal];
    ///// REFACTOR TO ALL ANALYSIS COMPONENTS
    var yearStillAvailable = false;
    for (var i = 0, limit = (defaultYearOptions.length - 1); i < limit; i++) {
      const defaultYearOption = defaultYearOptions[i].value;
      if (defaultYearOption === yearValue) {
        yearStillAvailable = true;
        break;
      };
    };
    /////
    const yearVal = yearStillAvailable ? yearValue : defaultYearOptions[0].value;
    //// ??? this too ^^ ????

    const defaultSelectedProp = this.propRegistry[fieldVal + yearVal];
    
    const { min, max, median, units } = fieldUnitAndRangeHandler(defaultSelectedProp, this.props.propsMd);
    
    const defaultRange = [min, max];
    const newSelectedRange = determineNewSelectedRange(defaultRange, selectedRange, oldUnits, units);

    const { unitFormatter } = choseFormatter(units);
    var medianLabel = 'median: ' + unitFormatter(median);
    var medianMark = {};
    medianMark[median] = medianLabel;
    this.setState({
      selectedProp: defaultSelectedProp,
      fieldValue: fieldVal,
      fieldLabel: fieldLabel,
      yearValue: yearVal,
      yearOptions: defaultYearOptions,

      range: [min, max],
      selectedRange: newSelectedRange,
      medianMark: medianMark,
      units: units,
      filterValid: false,
      freezeFilterValidity: false,
      alertSliderOfRedefinition: true
    });
  }

  handleYearSelection(val){
    const yearVal = val.value;
    const { fieldValue, selectedRange } = this.state;
    const oldUnits = this.state.units;

    const selectedProp = this.propRegistry[fieldValue + yearVal];
    const { min, max, median, units } = fieldUnitAndRangeHandler(selectedProp, this.props.propsMd);
    
    const defaultRange = [min, max];
    const newSelectedRange = determineNewSelectedRange(defaultRange, selectedRange, oldUnits, units);

    const { unitFormatter } = choseFormatter(units);
    var medianLabel = 'median: ' + unitFormatter(median);
    var medianMark = {};
    medianMark[median] = medianLabel;
    
    this.setState({
      selectedProp: selectedProp,
      yearValue: yearVal,

      range: [min, max],
      selectedRange: newSelectedRange,
      medianMark: medianMark,
      units: units,
      filterValid: false,
      freezeFilterValidity: false,
      alertSliderOfRedefinition: true
    });
  }

  //// SLIDER HANDLERS
  // BUG :: handle slider change is being called on change of field but, after change is not
  // thus, freezeFilterValidity is being left as true after field selections -- so far this is not affecting the process
  // but later on it might
  handleSliderChange(selectedRange){
    if (this.state.rangeMinInputActive){
      document.getElementsByClassName('rangeInput-min')[0].blur();
    } else  if (this.state.rangeMaxInputActive) {
      document.getElementsByClassName('rangeInput-max')[0].blur();
    }
    this.setState({
      selectedRange: selectedRange,
      freezeFilterValidity: this.state.alertSliderOfRedefinition ? false : true,
      alertSliderOfRedefinition: false
    });
  }

  handleSliderAfterChange(selectedRange){
    this.setState({
      selectedRange: selectedRange,
      filterValid: isSubRange(this.state.range, selectedRange),
      freezeFilterValidity: false
    });
  }

  //// RANGE INPUT HANDLERS

  handleRangeInputFocus(e){
    const className = e.target.className;
    if (className.indexOf('rangeInput-min') > -1){
      this.setState({
        rangeInputValue: this.state.selectedRange[0],
        rangeMinInputActive: true,
        freezeFilterValidity: true
      });
    } else if (className.indexOf('rangeInput-max') > -1){
      this.setState({
        rangeInputValue: this.state.selectedRange[1],
        rangeMaxInputActive: true,
        freezeFilterValidity: true
      });
    }
  }

  handleRangeInputBlur(e){
    const className = e.target.className;
    // MAKE A COPY
    var selectedRange = [...this.state.selectedRange];
    const { unitUnformatter } = choseFormatter(this.state.units);
    const rangeInputValue = unitUnformatter(this.state.rangeInputValue);
    if (className.indexOf('rangeInput-min') > -1){
      selectedRange[0] = validateAndNormalizeRangeInputValue(rangeInputValue, 'minimum', this.state.range, selectedRange);
      this.setState({
        selectedRange: selectedRange,
        rangeMinInputActive: false,
        filterValid: isSubRange(this.state.range, selectedRange),
        freezeFilterValidity: false
      });
    } else if (className.indexOf('rangeInput-max') > -1){
      selectedRange[1] = validateAndNormalizeRangeInputValue(rangeInputValue, 'maximum', this.state.range , selectedRange);
      this.setState({
        selectedRange: selectedRange,
        rangeMaxInputActive: false,
        filterValid: isSubRange(this.state.range, selectedRange),
        freezeFilterValidity: false
      });
    }
  }

  handleRangeInputKeydown(e){
    if (e.key === 'Enter'){
      e.target.blur();
    }
  }

  handleRangeInputChange(e){
    const { unitUnformatter } = choseFormatter(this.state.units);
    const newVal = unitUnformatter(e.target.value);
    this.setState({
      rangeInputValue: newVal
    });
  } 

  //// RENDERING

  render() {
    const { unitFormatter } = choseFormatter(this.state.units);
    const { displayFilterType } = this.props;
    return (
      <div  className="filter-container" id={this.props.id}>
        {displayFilterType
          ? <div className="filterType-container">
            <span className="filterType">AND</span>
          </div>
          : null
        }
        <div className="filter" >
          <div className='titleAndControls filterSection'>
            <ActiveSlider active={this.state.filterActive} handleActiveToggle={this.handleFilterActiveToggle} />
            <div className='removeFilterButton'>
              <span className='fa fa-trash' id={'rfb-' + this.props.id} onClick={this.handleRemoveFilter} />
            </div>
          </div>
          <div className='fieldSelector filterSection'>
            <span className='filterSection-title'>Field:</span>
            <Select
              className='select-field select'
              name="Select Field"
              value={this.state.fieldValue}
              options={this.state.fieldOptions}
              onChange={this.handleFieldSelection}
              clearable={false}
            />
          </div>
          <div className='yearSelector filterSection'>
            <span className='filterSection-title'>Year:</span>
            <Select
              className='select-year select'
              name="Select Year"
              value={this.state.yearValue}
              options={this.state.yearOptions}
              onChange={this.handleYearSelection}
              clearable={false}
            />
          </div>
          <div className='rangeSelector filterSection'>
            <span className='filterSection-title'>Range:</span>
            <div className='sliderContainer'>
              <div className='rangeInputContainer'>
                <div className='rangeInputSubCont-min rangeInputSubCont'>
                  <input className='rangeInput-min rangeInput' type="text" 
                        value={this.state.rangeMinInputActive
                                  ? this.state.rangeInputValue
                                  : unitFormatter(this.state.selectedRange[0])
                                } 
                        onFocus={this.handleRangeInputFocus} 
                        onBlur={this.handleRangeInputBlur}
                        onChange={this.handleRangeInputChange}
                        onKeyDown={this.handleRangeInputKeydown} />
                  <span className='rangeInputLabel rangeInputLabel-min'>min</span>
                </div>
                <div className='rangeInputSubCont-max rangeInputSubCont'>
                  <span className='rangeInputLabel rangeInputLabel-max'>max</span>
                  <input className='rangeInput-max rangeInput' type="text"
                        value={this.state.rangeMaxInputActive
                                  ? this.state.rangeInputValue
                                  : unitFormatter(this.state.selectedRange[1])
                                }
                        onFocus={this.handleRangeInputFocus} 
                        onBlur={this.handleRangeInputBlur}
                        onChange={this.handleRangeInputChange}
                        onKeyDown={this.handleRangeInputKeydown} />
                </div>
              </div>
              <Range className='slider' value={this.state.selectedRange} 
                    min={this.state.range[0]} max={this.state.range[1]}
                    marks={this.state.medianMark}
                    onChange={this.handleSliderChange} onAfterChange={this.handleSliderAfterChange} />
              
            </div>
          </div>
          <div className={'validationBar validationBar-' + (this.state.filterValid ? 'valid' : 'invalid') 
                          + ' validationBar-' +  (this.state.filterActive ? 'active' : 'inactive')} />
        </div>
      </div>
    );
  }
}
 export default Filter;
