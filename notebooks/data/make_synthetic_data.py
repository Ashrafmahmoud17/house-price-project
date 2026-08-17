"""
Generates a SYNTHETIC sample of house_prices.csv with the same columns/messiness
as the real Kaggle 'House Price' dataset (juhibhojani/house-price), so the
notebook pipeline can be built, run, and tested end-to-end without network access.

This is a STAND-IN only. Replace notebooks/data/house_prices.csv with the real
Kaggle download before final training - see README.md.
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
N = 4000

locations = [
    "Sector 62 Noida", "Andheri West Mumbai", "Whitefield Bangalore", "Gachibowli Hyderabad",
    "Baner Pune", "Salt Lake Kolkata", "Indiranagar Bangalore", "Powai Mumbai",
    "Vaishali Ghaziabad", "Dwarka Delhi", "HSR Layout Bangalore", "Kharadi Pune",
    "Rajarhat Kolkata", "Kondapur Hyderabad", "Thane West Mumbai", "Sector 137 Noida",
    "Wakad Pune", "Electronic City Bangalore", "New Town Kolkata", "Miyapur Hyderabad",
]
societies = [f"{n} Residency" for n in ["Green Valley", "Silver Oak", "Palm Grove", "Sunrise",
                                         "Lake View", "Royal Enclave", "Orchid", "Maple"]] + [None] * 6
furnishing_opts = ["Furnished", "Semi-Furnished", "Unfurnished"]
transaction_opts = ["New Property", "Resale"]
ownership_opts = ["Freehold", "Leasehold", "Co-operative Society", "Power Of Attorney"]
facing_opts = ["East", "West", "North", "South", "North-East", "South-West", None]
overlooking_opts = ["Garden/Park", "Main Road", "Pool", "Club", None]
status_opts = ["Ready to Move", "Under Construction"]

rows = []
for i in range(N):
    loc = rng.choice(locations)
    carpet_sqft = rng.normal(1200, 500)
    carpet_sqft = max(250, carpet_sqft)
    # sometimes report in sqm instead
    if rng.random() < 0.25:
        area_str = f"{round(carpet_sqft / 10.764)} sqm"
    else:
        area_str = f"{round(carpet_sqft)} sqft"
    super_sqft = carpet_sqft * rng.uniform(1.05, 1.3)
    super_str = f"{round(super_sqft)} sqft" if rng.random() > 0.1 else None

    bathroom = rng.integers(1, 5)
    balcony = rng.integers(0, 4)
    car_parking = rng.choice([0, 1, 1, 2, None])
    total_floors = rng.integers(1, 25)
    floor_num = rng.integers(0, total_floors + 1)
    floor_str = "Ground out of %d" % total_floors if floor_num == 0 else f"{floor_num} out of {total_floors}"

    # price roughly driven by area + location tier + noise, in rupees
    loc_multiplier = 1 + (hash(loc) % 100) / 100
    price_rupees = carpet_sqft * rng.uniform(4500, 9500) * loc_multiplier
    # inject occasional wild outliers
    if rng.random() < 0.01:
        price_rupees *= rng.uniform(8, 20)

    # format price as messy text like the real dataset
    r = rng.random()
    if r < 0.03:
        amount_str = "Call for Price"
    elif price_rupees >= 1e7:
        amount_str = f"{round(price_rupees / 1e7, 2)} Cr"
    else:
        amount_str = f"{round(price_rupees / 1e5, 1)} Lac"

    price_col_str = amount_str  # dataset has a near-duplicate 'Price (in rupees)' text column

    row = {
        "Title": f"{rng.integers(1,5)} BHK Flat for Sale in {loc}",
        "Description": "Spacious property with modern amenities, close to schools and markets.",
        "Amount(in rupees)": amount_str,
        "Price (in rupees)": price_col_str,
        "location": loc,
        "Carpet Area": area_str,
        "Status": rng.choice(status_opts),
        "Floor": floor_str,
        "Transaction": rng.choice(transaction_opts),
        "Furnishing": rng.choice(furnishing_opts),
        "facing": rng.choice(facing_opts),
        "overlooking": rng.choice(overlooking_opts),
        "Society": rng.choice(societies),
        "Bathroom": bathroom if rng.random() > 0.05 else None,
        "Balcony": balcony if rng.random() > 0.1 else None,
        "Car Parking": car_parking,
        "Ownership": rng.choice(ownership_opts),
        "Super Area": super_str,
        "Dimensions": None,
        "Plot Area": None,
        "Index": i,
    }
    rows.append(row)

df = pd.DataFrame(rows)
# scatter some fully-missing prices to mimic real messiness
drop_idx = rng.choice(df.index, size=int(0.01 * N), replace=False)
df.loc[drop_idx, "Amount(in rupees)"] = None

df.to_csv("/home/claude/house-price-project/notebooks/data/house_prices.csv", index=False)
print("Wrote", len(df), "rows")
print(df.head())
