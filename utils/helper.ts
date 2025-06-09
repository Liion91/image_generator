export const getImageDimansion = (aspectRatio: string, baeSize = 512) => {
  const [widthRatio, heightRatio] = aspectRatio.split("/").map(Number);
  const scaleFactor = baeSize / Math.sqrt(widthRatio * heightRatio);

  let calculatedWidth = Math.round(widthRatio * scaleFactor);
  let calculatedHeight = Math.round(heightRatio * scaleFactor);

  // Ensure dimensions are even multiple of 16
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return {
    width: calculatedWidth,
    height: calculatedHeight,
  };
};
