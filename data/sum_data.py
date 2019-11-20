import pandas as pd
import csv
from dask import dataframe as dd

df = dd.read_csv(r'C:\Users\profile\Desktop\data stuff\arcos_all_washpost.tsv', delimiter='\t', blocksize=64000000, dtype={'ACTION_INDICATOR': 'object', 'ORDER_FORM_NO': 'object', 'REPORTER_ADDRESS2': 'object', 'NDC_NO': 'object', 'UNIT': 'object'})

df = df.drop(df.columns.difference(['TRANSACTION_DATE', 'BUYER_COUNTY', 'BUYER_STATE', 'QUANTITY', 'DOSAGE_UNIT']), 1)
df['YEAR'] = df['TRANSACTION_DATE'].astype(str).str[-4:]

print(df.head())

sum_df = df.groupby(['BUYER_STATE', 'BUYER_COUNTY', 'YEAR']).agg({'QUANTITY': 'sum', 'DOSAGE_UNIT': 'sum'}).reset_index()

print(sum_df.head())

sum_df.to_csv('total_data.csv', index=False, mode='w', header=True)