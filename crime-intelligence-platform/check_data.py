import pandas as pd

df = pd.read_csv("data/processed/final_project_dataset.csv")

print("Total rows:", len(df))
print("\nLast 10 rows:")
print(df.tail(10))

print("\nRows where State is NaN:")
print(df[df["State"].isna()])

print("\nRows where State == 'NaN':")
print(df[df["State"].astype(str).str.lower() == "nan"])