import pandas as pd

chunksize = 10 ** 6
i=0
output = {}
tsvline = pd.read_csv(r'arcos_all_washpost.tsv', chunksize=chunksize, sep='\t', header=0,usecols=['TRANSACTION_DATE','BUYER_COUNTY','BUYER_STATE','QUANTITY','DOSAGE_UNIT'])

for chunk in tsvline:
    chunk['YEAR'] = chunk['TRANSACTION_DATE'].astype(str).str[-4:]
    sum_chunks = chunk.groupby(['BUYER_STATE','BUYER_COUNTY','YEAR']).agg({'QUANTITY':'sum','DOSAGE_UNIT':'sum'}).reset_index()
    print(str(i)+'/178'+str(round(i/178,2)*100)+'%')
    i+=1
sum_chunks.to_csv('total_data.csv',index=False,mode='w',header=True)
