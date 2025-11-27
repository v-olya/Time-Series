import pandas
import glob
import os

folders = ["../dairy/", "../eggs/", "../flour/"]

for folder in folders:
# Collect all CSV files in the folder

    csv_files = glob.glob(os.path.join(folder, "*.csv"))

    data_files = []

    for file in csv_files:
        product = os.path.splitext(os.path.basename(file))[0].capitalize()
        df = pandas.read_csv(file)
        df["Month"] = pandas.to_datetime(df["Month"], format="%Y-%m")
        df = df.rename(columns={"Value": product})
        data_files.append(df)

    # Merge all DataFrames on Month
    merged = data_files[0]
    for df in data_files[1:]:
        merged = pandas.merge(merged, df, on="Month", how="outer")

    # Set Month as datetime index
    merged = merged.set_index("Month").sort_index()

    # Add aggregate dairy index (mean of all product columns)
    merged[f"{os.path.basename(os.path.normpath(folder))}Index"] = merged.mean(axis=1)

    merged.to_csv(f"../merged_{os.path.basename(os.path.normpath(folder))}_prices.csv")
