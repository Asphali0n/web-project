import pandas as pd


# -- Import Datasets --

# covid-hospit-clage10-2023-03-31-18h01.csv
age = pd.read_csv("https://www.data.gouv.fr/api/1/datasets/r/08c18e08-6780-452d-9b8c-ae244ad529b3", sep=";")
# covid-hospit-2023-03-31-18h01.csv
sex = pd.read_csv("https://www.data.gouv.fr/api/1/datasets/r/63352e38-d353-4b54-bfd1-f1b3ee1cabd7", sep=";")
# mmc1.xlsx
age_with_sex = pd.read_excel('mmc1.xlsx', sheet_name='data')


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


# -- Operations for Chart2 --

df_chart2 = sex
df_chart2.drop(columns=(['rea', 'hosp', 'dep']))
df_chart2 = df_chart2[(df_chart2.sexe != 0) & (df_chart2.jour == '2023-03-31')]
agg_rules = {
    'jour' : 'last',
    'rad' : 'sum',
    'dc' : 'sum'
}
df_chart2 = df_chart2.groupby('sexe').agg(agg_rules).reset_index()
df_chart2 = df_chart2.drop(columns=(['jour']))



# -- Export to json --

age.to_json("age.json")
sex.to_json("sex.json")
age_with_sex.to_json('age_with_sex.json')
df_chart2.to_json('chart2.json')


