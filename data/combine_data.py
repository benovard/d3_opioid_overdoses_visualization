import csv
import pandas as pd

drugOD = pd.read_csv(r'drug_overdoses_2006-2016_cleaned.csv',header=0,usecols=['Year','State','County','Population','Deaths','Death Rate per 100k'])
drugOD['County'] = (drugOD['County'] + drugOD['State']).str.upper()
drugOD = drugOD.drop('State',axis=1)

drugSales = pd.read_csv(r'total_data.csv',header=0,usecols=['BUYER_STATE','BUYER_COUNTY','YEAR','QUANTITY','DOSAGE_UNIT'])
drugSales['County'] = drugSales['BUYER_COUNTY'] + drugSales['BUYER_STATE']
drugSales = drugSales.drop(['BUYER_COUNTY','BUYER_STATE'],axis=1)

weather = pd.read_csv(r'NALDAS_DAILY-MAX-AIR-TEMP-AVG.tsv',sep='\t',header=0,usecols=['Notes','County','County Code','Year','Year Code','Avg Daily Max Air Temperature (F)'])
for index,row in weather.iterrows():
        row['County'] = row['County'][-2:] + row['County'].split(',')[0]

print(drugOD)
print(drugSales)
print(weather)
