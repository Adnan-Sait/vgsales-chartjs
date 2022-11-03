const COLORS = [
  "#4dc9f6",
  "#f67019",
  "#f53794",
  "#537bc4",
  "#acc236",
  "#166a8f",
  "#00a950",
  "#58595b",
  "#8549ba"
];

/**
 * Calculates the step size for chart.
 *
 * @param {Number} minValue
 * @param {Number} maxValue
 * @param {Number} desiredSteps
 */
export const calculateStepSize = (minValue, maxValue, desiredSteps) => {
  let idealStepSize = Math.ceil(maxValue / desiredSteps);
  idealStepSize = Math.floor(idealStepSize / 100) * 100;

  // The step size should not be greater than the lowest data value in chart.
  if (idealStepSize > minValue) {
    idealStepSize = Math.floor(minValue / 100) * 100;
  }

  return idealStepSize;
};

export const getColor = (index) => {
  return COLORS[index % COLORS.length];
};
