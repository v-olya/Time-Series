r"""For each category, reads CSVs in `web/public/data/`, 
computes transforms (parse dates, standard scaling, 12-month rolling mean/std, STL decomposition, ACF) 
and writes `web/public/data/processed/{category}_eda.json`.

"""
from pathlib import Path
import json
import pandas as pd
import numpy as np

from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import acf
from sklearn.preprocessing import StandardScaler


BASE = Path(__file__).resolve().parents[1]
DATA_DIR = BASE / "web" / "public" / "data"
INPUT_FILES = {
    "dairy": DATA_DIR / "merged_dairy_prices.csv",
    "eggs": DATA_DIR / "merged_eggs_prices.csv",
    "flour": DATA_DIR / "merged_flour_prices.csv",
}

OUT_DIR = DATA_DIR / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def to_iso(series: pd.Series):
    return [{"date": d.strftime("%Y-%m-%d"), "value": (float(v) if pd.notna(v) else None)} for d, v in series.items()]


def process_file(name: str, path: Path):
    print(f"Processing {name} from {path}")
    df = pd.read_csv(path, parse_dates=["Month"])  # expects Month column
    df = df.set_index("Month").asfreq("MS")

    numeric = df.select_dtypes(include=[np.number]).copy()
    if numeric.shape[1] == 0:
        print(f"No numeric columns found in {path}, skipping")
        return

    preferred = f"{name}Index"
    if preferred in numeric.columns:
        target_col = preferred
    else:
        target_col = numeric.columns[0]

    series = numeric[target_col].astype(float)

    scaler = StandardScaler()
    series_scaled = pd.Series(scaler.fit_transform(series.values.reshape(-1, 1)).flatten(), index=series.index)

    rolling_mean_12 = series.rolling(window=12, min_periods=1).mean()
    rolling_std_12 = series.rolling(window=12, min_periods=1).std()

    stl = STL(series.dropna(), period=12, robust=True)
    res = stl.fit()
    trend = res.trend.reindex(series.index)
    seasonal = res.seasonal.reindex(series.index)
    resid = res.resid.reindex(series.index)

    acf_vals = acf(series.dropna(), nlags=36, fft=False)
    lags = list(range(len(acf_vals)))

    observed = to_iso(series)

    series_dict = {}
    for col in numeric.columns:
        col_series = numeric[col].astype(float)
        series_dict[col] = to_iso(col_series)

    out = {
        "meta": {"series": target_col, "start": observed[0]["date"], "end": observed[-1]["date"], "freq": "MS"},
        "observed": observed,
        "series": series_dict,
        "scaled": to_iso(series_scaled),
        "rolling": {"ma_12": to_iso(rolling_mean_12), "std_12": to_iso(rolling_std_12)},
        "decomposition": {"trend": to_iso(trend), "seasonal": to_iso(seasonal), "resid": to_iso(resid)},
        "acf": {"lags": lags, "values": [float(v) for v in acf_vals]},
        "metrics": {},
    }

    out_path = OUT_DIR / f"{name}_eda.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"Wrote {out_path}")


def main():
    for name, path in INPUT_FILES.items():
        if not path.exists():
            print(f"Input missing: {path}")
            continue
        process_file(name, path)


if __name__ == "__main__":
    main()