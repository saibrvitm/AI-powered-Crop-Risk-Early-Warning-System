import matplotlib.pyplot as plt
from rasterio.plot import show

def plot_overlay(tif_path, shapefile_path):
    import geopandas as gpd
    import rasterio

    gdf = gpd.read_file(shapefile_path)
    with rasterio.open(tif_path) as src:
        fig, ax = plt.subplots(figsize=(10, 10))
        show(src, ax=ax, title="Raster + District Boundaries")
        gdf.boundary.plot(ax=ax, color='red', linewidth=0.5)
        plt.show()

# Call it with your file paths
plot_overlay("datasets/ndvi_buffered_karnataka.tif", "datasets/IND_adm2.shp")
