var dataset = ee.ImageCollection('MODIS/061/MOD13Q1')
  .filterDate('2024-01-01', '2024-03-31')
  .select('NDVI');

var meanNDVI = dataset.mean();

var clippedNDVI = meanNDVI.clip(roi);

Export.image.toDrive({
  image: clippedNDVI,
  description: 'NDVI_Export',
  folder: 'GEE_exports',
  scale: 250,
  region: roi,
  fileFormat: 'GeoTIFF'
});
