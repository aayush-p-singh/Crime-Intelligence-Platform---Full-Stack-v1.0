import pandas as pd


def load_dataset():
    """
    Load the processed dataset.
    """

    df = pd.read_csv("data/processed/final_project_dataset.csv")

    # Remove unwanted index columns if they exist
    df = df.loc[:, ~df.columns.str.contains("^Unnamed")]

    # Remove blank rows
    df = df.dropna(subset=["State"])

    # Clean state names
    df["State"] = df["State"].astype(str).str.strip()

    # Remove accidental "nan" strings
    df = df[df["State"].str.lower() != "nan"]

    df = df.reset_index(drop=True)

    return df


def create_risk_labels(df):
    """
    Generate Risk_Level from crime indicators.
    """

    score = (
        (df["Crime_Rate_2022"] * 0.5)
        + (df["Women_Crime_%"] * 0.3)
        + ((100 - df["Chargesheet_Rate_2022"]) * 0.2)
    )

    df["Risk_Score"] = score

    low = score.quantile(0.33)
    high = score.quantile(0.66)

    def label(x):
        if x <= low:
            return "Low"
        elif x <= high:
            return "Medium"
        else:
            return "High"

    df["Risk_Level"] = score.apply(label)

    return df


def get_features():
    """
    Returns ML features and labels.
    """

    df = load_dataset()
    df = create_risk_labels(df)

    X = df[
        [
            "Crime_Rate_2022",
            "Women_Crimes_2022",
            "Chargesheet_Rate_2022",
        ]
    ]

    y = df["Risk_Level"]

    return X, y


if __name__ == "__main__":

    df = load_dataset()
    df = create_risk_labels(df)

    # Save cleaned dataset
    df.to_csv(
        "data/processed/final_project_dataset.csv",
        index=False
    )

    print("✅ Dataset cleaned successfully!")
    print(f"Rows: {len(df)}")