/**
 * Calculate median from a pre-sorted array of numbers
 * @param {number[]} sortedArr
 * @returns {number|null}
 */
const calculateMedian = (sortedArr) => {
  const n = sortedArr.length;
  if (n === 0) return null;
  const mid = Math.floor(n / 2);
  if (n % 2 !== 0) {
    return Number(sortedArr[mid].toFixed(2));
  }
  const median = (sortedArr[mid - 1] + sortedArr[mid]) / 2;
  return Number(median.toFixed(2));
};

/**
 * Generate discrete histogram bins and frequencies from numeric values
 * @param {number[]} values Array of numbers
 * @param {number} desiredBins Target number of bins (default: 10)
 * @returns {Array<{ binLabel: string, min: number, max: number, count: number }>}
 */
const generateHistogramBins = (values, desiredBins = 10) => {
  if (!values || values.length === 0) {
    return [];
  }

  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val < min) min = val;
    if (val > max) max = val;
  }

  // Handle case where all values are identical
  if (min === max) {
    return [
      {
        binLabel: `${Math.round(min)}`,
        min: Math.floor(min),
        max: Math.ceil(max),
        count: values.length,
      },
    ];
  }

  const binCount = Math.min(desiredBins, Math.max(3, Math.floor(Math.sqrt(values.length))));
  const binWidth = (max - min) / binCount;

  const bins = [];
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth;
    const binEnd = i === binCount - 1 ? max : min + (i + 1) * binWidth;
    bins.push({
      binLabel: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`,
      min: Number(binStart.toFixed(2)),
      max: Number(binEnd.toFixed(2)),
      count: 0,
    });
  }

  // Fill bin counts
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    let placed = false;
    for (let b = 0; b < bins.length; b++) {
      const isLastBin = b === bins.length - 1;
      if (
        (val >= bins[b].min && val < bins[b].max) ||
        (isLastBin && val >= bins[b].min && val <= bins[b].max)
      ) {
        bins[b].count++;
        placed = true;
        break;
      }
    }
    if (!placed && bins.length > 0) {
      // Edge cases due to float precision
      if (val <= bins[0].min) bins[0].count++;
      else bins[bins.length - 1].count++;
    }
  }

  return bins;
};

module.exports = {
  calculateMedian,
  generateHistogramBins,
};
