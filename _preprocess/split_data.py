import pandas

data = pandas.read_csv("CEN02.csv")

# Define groups
dairy_products = ["Z  Mléko kravské Q. tř. j. [l]", "P  Mléko polotučné [l]", "S  Mléko polotučné pasterované [l]", "P  Máslo [kg]", "S  Máslo [kg]", "P  Eidamská cihla [kg]", "S  Eidamská cihla [kg]"]
eggs = ["Z  Vejce slepičí konzumní tříděná [ks]", "S  Vejce slepičí čerstvá [ks]"]
flours = ["Z  Pšenice potravinářská [kg]", "P  Pšeničná mouka hladká 00 extra [kg]", "P  Pšeničná mouka chlebová [kg]", "S  Pšeničná mouka hladká [kg]"]

# Loop and save
for product in dairy_products + eggs + flours:
    subset = data[data['Ukazatel'] == product]
    if not subset.empty:
        subset.to_csv(f"{product}_timeseries.csv", index=False)