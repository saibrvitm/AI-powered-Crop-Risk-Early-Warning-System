import geopandas as gpd
import rasterio
import rasterio.mask
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

def get_region_info(geometry):
    """Get center coordinates and bounds of a region"""
    bounds = geometry.bounds
    center = geometry.centroid
    return {
        'min_lon': bounds[0],
        'min_lat': bounds[1],
        'max_lon': bounds[2],
        'max_lat': bounds[3],
        'center_lon': center.x,
        'center_lat': center.y
    }

def process_ndvi_data(tif_path, shapefile_path):
    try:
        # Load shapefile with all attributes
        regions = gpd.read_file(shapefile_path)
        raster_crs = regions.crs
        regions = regions.to_crs(raster_crs)
        print("Shapefile CRS:", regions.crs)
        print("Number of regions:", len(regions))
        
        # Print all available columns
        print("\nAvailable columns in shapefile:")
        print(regions.columns.tolist())
        
        # # Print sample data for first few regions
        # print("\nSample data for first 5 regions:")
        # pd.set_option('display.max_columns', None)  # Show all columns
        # print(regions.head().to_string())
        
        # Open NDVI GeoTIFF
        with rasterio.open(tif_path) as src:
            print("\nRaster CRS:", src.crs)
            print("Raster shape:", src.shape)
            
            # Get raster bounds
            raster_bounds = src.bounds
            
            # Filter regions that might overlap with raster
            overlapping_regions = []
            for idx, row in regions.iterrows():
                region_info = get_region_info(row['geometry'])
                if not (region_info['max_lon'] < raster_bounds.left or
                        region_info['min_lon'] > raster_bounds.right or
                        region_info['max_lat'] < raster_bounds.bottom or
                        region_info['min_lat'] > raster_bounds.top):
                    overlapping_regions.append((idx, row))

            
            print(f"\nFound {len(overlapping_regions)} potentially overlapping regions")
            
            results = []
            
            for idx, row in overlapping_regions:
                try:
                    geometry = [row['geometry']]
                    region_info = get_region_info(row['geometry'])
                    
                    # Check if this region is near Bengaluru (approximate coordinates)
                    is_bengaluru = (region_info['center_lon'] > 77.4 and 
                                  region_info['center_lon'] < 77.8 and 
                                  region_info['center_lat'] > 12.8 and 
                                  region_info['center_lat'] < 13.2)
                    
                    out_image, out_transform = rasterio.mask.mask(src, geometry, crop=True)
                    
                    if out_image.size == 0:
                        print(f"No data for region {idx}")
                        continue
                        
                    masked_data = out_image[0]
                    masked_data = np.ma.masked_equal(masked_data, src.nodata)
                    
                    # Handle MODIS NDVI scaling (multiply by 0.0001)
                    masked_data = masked_data * 0.001
                    
                    # Mask invalid values
                    masked_data = np.ma.masked_outside(masked_data, -1, 1)
                    
                    if masked_data.mask.all():
                        print(f"All data masked for region {idx}")
                        continue
                        
                    mean_val = masked_data.mean()
                    
                    # Get all attributes for this region
                    region_attrs = {col: row[col] for col in regions.columns if col != 'geometry'}
                    
                    results.append({
                        'Region': f'Region_{idx}',
                        'Mean_NDVI': mean_val,
                        'Center_Lon': region_info['center_lon'],
                        'Center_Lat': region_info['center_lat'],
                        'Is_Bengaluru': is_bengaluru,
                        **region_attrs  # Include all shapefile attributes
                    })
                    
                except Exception as e:
                    print(f"Error processing region {idx}: {str(e)}")
                    continue
            
            # Sort results by NDVI value
            results.sort(key=lambda x: x['Mean_NDVI'], reverse=True)
            
            # Display results
            print("\nNDVI Results by Region:")
            print("-" * 120)
            # Print all available columns
            header = "Region NDVI Center_Lon Center_Lat Is_Bengaluru"
            if results:
                for col in results[0].keys():
                    if col not in ['Region', 'Mean_NDVI', 'Center_Lon', 'Center_Lat', 'Is_Bengaluru']:
                        header += f" {col}"
            print(header)
            print("-" * 120)
            
            for r in results:
                row_str = f"{r['Region']} {r['Mean_NDVI']:.4f} {r['Center_Lon']:.4f} {r['Center_Lat']:.4f} {r['Is_Bengaluru']}"
                for col in r.keys():
                    if col not in ['Region', 'Mean_NDVI', 'Center_Lon', 'Center_Lat', 'Is_Bengaluru']:
                        row_str += f" {r[col]}"
                # print(row_str)
            
            # Create bar plot
            plt.figure(figsize=(15, 8))
            regions = [r['Region'] for r in results]
            values = [r['Mean_NDVI'] for r in results]
            colors = ['red' if r['Is_Bengaluru'] else 'blue' for r in results]
            
            plt.bar(regions, values, color=colors)
            plt.xticks(rotation=45, ha='right')
            plt.title('Average NDVI by Region (Red = Near Bengaluru)')
            plt.ylabel('NDVI')
            plt.tight_layout()
            plt.savefig('ndvi_plot.png')
            plt.close()
            
            # Save results to CSV with all attributes
            df = pd.DataFrame(results)
            df.to_csv('ndvi_results.csv', index=False)
            print("\nResults saved to ndvi_results.csv")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Update these paths to match your file locations
    tif_path = "../datasets/ndvi_buffered_karnataka.tif"
    shapefile_path = "../datasets/IND_adm2.shp"  # Use .shp instead of .shx
    
    process_ndvi_data(tif_path, shapefile_path)
