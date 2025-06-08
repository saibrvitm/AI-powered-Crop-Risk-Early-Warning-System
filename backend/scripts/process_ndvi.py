import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def process_ndvi_csv(csv_path):
    # Read the CSV file
    df = pd.read_csv(csv_path)
    
    # Filter out rows with NaN or invalid NDVI values
    valid_ndvi = df.dropna(subset=['Mean_NDVI'])
    
    # Sort by NDVI value
    valid_ndvi = valid_ndvi.sort_values('Mean_NDVI', ascending=False)
    
    # Print summary statistics
    print("\nNDVI Summary Statistics:")
    print("-" * 50)
    print(f"Total regions: {len(df)}")
    print(f"Regions with valid NDVI: {len(valid_ndvi)}")
    print(f"Average NDVI: {valid_ndvi['Mean_NDVI'].mean():.4f}")
    print(f"Min NDVI: {valid_ndvi['Mean_NDVI'].min():.4f}")
    print(f"Max NDVI: {valid_ndvi['Mean_NDVI'].max():.4f}")
    
    # Print regions with valid NDVI in a simplified format
    print("\nRegions with Valid NDVI:")
    print("-" * 80)
    print(f"{'Region':<10} {'NDVI':<10} {'Center Lon':<12} {'Center Lat':<12} {'Near Bengaluru':<15}")
    print("-" * 80)
    
    for _, row in valid_ndvi.iterrows():
        print(f"{row['Region']:<10} {row['Mean_NDVI']:.4f} {row['Center_Lon']:.4f} {row['Center_Lat']:.4f} {row['Is_Bengaluru']}")
    
    # Create a simple bar plot
    plt.figure(figsize=(12, 6))
    sns.barplot(data=valid_ndvi, x='Region', y='Mean_NDVI')
    plt.xticks(rotation=45, ha='right')
    plt.title('NDVI Values by Region')
    plt.tight_layout()
    plt.savefig('ndvi_plot.png')
    plt.close()
    
    # Save valid NDVI data to new CSV with simplified columns
    output_df = valid_ndvi[['Region', 'Mean_NDVI', 'Center_Lon', 'Center_Lat',  'NAME_1', 'ID_2', 'NAME_2', 'TYPE_2', 'ENGTYPE_2', 'VARNAME_2']]
    output_path = 'valid_ndvi_results.csv'
    output_df.to_csv(output_path, index=False)
    print(f"\nValid NDVI results saved to {output_path}")

if __name__ == "__main__":
    csv_path = "ndvi_results.csv"
    process_ndvi_csv(csv_path) 