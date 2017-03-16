export const constructVisEventData = visSetting => {
  return {
    field: visSetting.selectedProp,
    classes: visSetting.classNumValue,
    palette: visSetting.paletteValue,
    unitFormatter: visSetting.unitFormatter,
    visActive: visSetting.visActive
  }
}

export const constructVisPassFailEventData = (filterSettings) => {
  return Object.keys(filterSettings).reduce((acc, key) => {
    if ((filterSettings[key].selectedRange[0] === filterSettings[key].range[0] 
        && filterSettings[key].selectedRange[1] === filterSettings[key].range[1]) ||
        !filterSettings[key].filterActive){
      return acc;
    } else {
      acc.push({
        key: key,
        field: filterSettings[key].selectedProp,
        range: filterSettings[key].selectedRange
      });
    }
    return acc;
  }, []);
}

export const visEventsAreDifferent = (last, next) => {
  if (last === null){
    return true;
  }
  if (last.field !== next.field || 
      last.classes !== next.classes ||
      last.palette !== next.palette || 
      last.visActive !== next.visActive ) {
    return true;
  } else {
    return false;
  }
}

export const visPassFailEventsAreDifferent = (last, next) => {
  let differenceExists;
  if (last.length !== next.length) {
    return true;
  } else if (last.length === 0 && next.length === 0){
    return false;
  } else {
    last.forEach(lastFiltSetting => {
      next.forEach(nextFiltSetting => {
        if (lastFiltSetting.key === nextFiltSetting.key){
          if (lastFiltSetting.field !== nextFiltSetting.field 
              || lastFiltSetting.range[0] !== nextFiltSetting.range[0]
              || lastFiltSetting.range[1] !== nextFiltSetting.range[1]){
                differenceExists = true
              }
        }
      });
    });
  }
  return differenceExists;
}