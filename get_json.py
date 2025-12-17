import pandas as pd
from load_mmc1 import load_mmc1


# -- Import Datasets --

# covid-hospit-clage10-2023-03-31-18h01.csv
age = pd.read_csv("https://www.data.gouv.fr/api/1/datasets/r/08c18e08-6780-452d-9b8c-ae244ad529b3", sep=";")
# covid-hospit-2023-03-31-18h01.csv
sex = pd.read_csv("https://www.data.gouv.fr/api/1/datasets/r/63352e38-d353-4b54-bfd1-f1b3ee1cabd7", sep=";")
# mmc1.xlsx
age_with_sex = load_mmc1()


# -- Initial print -- 

print("INITIAL DATASETS \n")
print('Age dataset \n')
print(age.head(3))
print('\n Sex dataset \n')
print(sex.head(3))
print('\n Age with sex dataset \n')
print(age_with_sex.head(3))


# -- Modifications on datasets --

# Drop columns
age = age.drop(columns=["SSR_USLD", "HospConv", "autres"])
sex = sex.drop(columns=["SSR_USLD", "HospConv", "autres"])
age_with_sex.drop(columns=['country_source'])
# Standardize datasets
age_with_sex = age_with_sex.replace({'both':0, 'female':1, 'male':2})


# -- Print after modifications --

print("AFTER MODIFICATIONS \n")
print('Age dataset \n')
print(age.head(3))
print('\n Sex dataset \n')
print(sex.head(3))
print('\n Age with sex dataset \n')
print(age_with_sex.head(3))


# -- Operations for Chart1_1 --

df_chart1_1 = age
df_chart1_1.drop(columns=(['rea', 'hosp', 'reg']))
df_chart1 = df_chart1_1[(df_chart1_1.cl_age90 != 0) & (df_chart1_1.jour == '2023-03-31')]
agg_rules = {
    'jour': 'last',
    'rad': 'sum',
    'dc': 'sum'
}
df_chart1_1 = df_chart1_1.groupby('cl_age90').agg(agg_rules).reset_index()
df_chart1_1 = df_chart1_1.drop(columns=(['jour']))


# -- Operations for Chart2_1 --

df_chart2_1 = sex
df_chart2_1.drop(columns=(['rea', 'hosp', 'dep']))
df_chart2_1 = df_chart2_1[(df_chart2_1.sexe != 0) & (df_chart2_1.jour == '2023-03-31')]
agg_rules = {
    'jour' : 'last',
    'rad' : 'sum',
    'dc' : 'sum'
}
df_chart2_1 = df_chart2_1.groupby('sexe').agg(agg_rules).reset_index()
df_chart2_1 = df_chart2_1.drop(columns=(['jour']))



# -- Export to json --

age.to_json("age.json")
sex.to_json("sex.json")
age_with_sex.to_json('age_with_sex.json')
df_chart1_1.to_json('chart1_1.json')
df_chart2_1.to_json('chart2_1.json')


