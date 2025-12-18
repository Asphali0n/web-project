import pandas as pd
from load_mmc1 import load_mmc1


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


# -- Operations for Chart1_1 --

df_chart1_1 = age
df_chart1_1.drop(columns=(['rea', 'hosp', 'reg']))
# On prend juste les lignes avec la dernière date car c'est la somme des décès et rémissions
df_chart1_1 = df_chart1_1[(df_chart1_1.cl_age90 != 0) & (df_chart1_1.jour == '2023-03-31')]
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
# On prend juste les lignes avec la dernière date car c'est la somme des décès et rémissions
df_chart2_1 = df_chart2_1[(df_chart2_1.sexe != 0) & (df_chart2_1.jour == '2023-03-31')]
agg_rules = {
    'jour' : 'last',
    'rad' : 'sum',
    'dc' : 'sum'
}
df_chart2_1 = df_chart2_1.groupby('sexe').agg(agg_rules).reset_index()
df_chart2_1 = df_chart2_1.drop(columns=(['jour']))


# -- Operations for Chart2_3 --

df_chart2_3 = sex
df_chart2_3 = df_chart2_3.drop(columns=(['rea', 'hosp']))
# On prend juste les lignes avec la dernière date car c'est la somme des décès et rémissions
df_chart2_3 = df_chart2_3[(df_chart2_3.sexe != 0) & (df_chart2_3.jour == '2023-03-31')]
df_chart2_3 = df_chart2_3.drop(columns=(['jour'])).reset_index(drop=True)



# -- Operations for Chart1_2 --

# nettoyage de base
df_chart1_2 = age.copy()
df_chart1_2['jour'] = pd.to_datetime(df_chart1_2['jour'])
df_chart1_2 = df_chart1_2[df_chart1_2.cl_age90 != 0]

# fusion des tranches d'age
df_chart1_2['cl_age90'] = df_chart1_2['cl_age90'].replace(
    {9: '0-59', 19: '0-59', 29: '0-59', 39: '0-59', 49: '0-59', 59: '0-59'})
df_chart1_2 = df_chart1_2.groupby(['jour', 'cl_age90'], as_index=False)['dc'].sum()


# somme des décés par age
df_chart1_2_jour = df_chart1_2.groupby(
    ['jour', 'cl_age90'], as_index=False)[['dc']].sum()
df_chart1_2_jour = df_chart1_2_jour.sort_values(['cl_age90', 'jour'])

# calcul des décés par jour (en gros ne plus avoir le cumul mais le nombre éxacte par jour)
df_chart1_2_jour['dc_new'] = df_chart1_2_jour.groupby(
    'cl_age90')['dc'].diff().fillna(0).clip(lower=0)

# Pivot (J'ai pas trouvé plus sipmple pour faire mon truc et c plus)
df_pivot = df_chart1_2_jour.pivot(
    index='jour', columns='cl_age90', values='dc_new'
).reset_index().fillna(0)
df_pivot['jour'] = df_pivot['jour'].astype(str)

# je Calcul à nouveau mais pour les mois puis je refais un pivot
df_chart1_2_mois = df_chart1_2_jour.copy()
df_chart1_2_mois['mois'] = df_chart1_2_mois['jour'].dt.to_period('M').astype(str)
df_mois_grouped = df_chart1_2_mois.groupby(['mois', 'cl_age90'], as_index=False)[
    ['dc_new']].sum()

df_chart1_2_mois = df_mois_grouped.pivot(
    index='mois', columns='cl_age90', values='dc_new'
).reset_index().fillna(0)



# -- Operations for Chart2_2 --

# nettoyage de base
df_chart2_2 = sex.copy()
df_chart2_2['jour'] = pd.to_datetime(df_chart2_2['jour'])
df_chart2_2 = df_chart2_2[df_chart2_2.sexe != 0]

# somme des décès par sexe
df_chart2_2_jour = df_chart2_2.groupby(
    ['jour', 'sexe'], as_index=False)[['dc']].sum()
df_chart2_2_jour = df_chart2_2_jour.sort_values(['sexe', 'jour'])

# calcul des décés par jour (en gros ne plus avoir le cumul mais le nombre éxacte par jour)
df_chart2_2_jour['dc_new'] = df_chart2_2_jour.groupby(
    'sexe')['dc'].diff().fillna(0).clip(lower=0)

# je Calcul à nouveau mais pour les mois puis je refais un pivot
df_chart2_2_mois = df_chart2_2_jour.copy()
df_chart2_2_mois['mois'] = df_chart2_2_mois['jour'].dt.to_period('M').astype(str)
df_mois_grouped = df_chart2_2_mois.groupby(['mois', 'sexe'], as_index=False)[
    ['dc_new']].sum()

df_chart2_2_mois = df_mois_grouped.pivot(
    index='mois', columns='sexe', values='dc_new'
).reset_index().fillna(0)





# -- Export to json --

age.to_json("age.json")
sex.to_json("sex.json")
age_with_sex.to_json('age_with_sex.json')
df_chart1_1.to_json('chart1_1.json')
df_chart2_1.to_json('chart2_1.json')
df_chart2_3.to_json('chart2_3.json')
df_pivot.to_json('chart1_2_jour.json', orient='records')
df_chart1_2_mois.to_json('chart1_2_mois.json', orient='records')
df_chart2_2_mois.to_json('chart2_2_mois.json', orient='records')

