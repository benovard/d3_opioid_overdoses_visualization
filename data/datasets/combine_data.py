import pandas as pd

# this is some of the worst python I have ever written...

drugOD = pd.read_csv(r'drug_overdoses_2006-2016_cleaned.csv',header=0,usecols=['Year','State','County','Population','Deaths','Death Rate per 100k'])
drugOD['County'] = (drugOD['County'] + drugOD['State']).str.upper()
drugOD = drugOD.drop('State',axis=1)

drugSales = pd.read_csv(r'total_data.csv',header=0,usecols=['BUYER_STATE','BUYER_COUNTY','YEAR','QUANTITY','DOSAGE_UNIT'])
drugSales['County'] = drugSales['BUYER_COUNTY'] + drugSales['BUYER_STATE']
drugSales = drugSales.drop(['BUYER_COUNTY','BUYER_STATE'],axis=1)
drugSales = drugSales.rename(columns={'YEAR':'Year','QUANTITY':'Quantity','DOSAGE_UNIT':'Dosage Unit'})

weather = pd.read_csv(r'NALDAS_DAILY-MAX-AIR-TEMP-AVG.tsv',sep='\t',header=0,usecols=['Notes','County','County Code','Year','Year Code','Avg Daily Max Air Temperature (F)'])
weather['County'] = (weather['County'].str.split(',').str[0].str.split(' ').str[:-1].str.join('') + weather['County'].str[-2:]).str.upper()
weather = weather.drop(weather.tail(18).index)
weather = weather.drop('Year Code',axis=1)
weather = weather.rename(columns={'Avg Daily Max Air Temperature (F)':'Temp'})
weatherTotal = weather[weather['Notes'] == 'Total']
weather = weather.drop('Notes',axis=1)
weather = weather.dropna()
weatherTotal = weatherTotal.drop(['Notes','Year'],axis=1)

#print(drugOD)
#print(drugSales)
#print(weather)
#print(weatherTotal)

dODCounties = drugOD['County'].tolist()
dSCounties = drugSales['County'].tolist()
wCounties = weather['County'].tolist()
counties = set().union(dODCounties, dSCounties, wCounties)
k = 0
print('{')
for i in counties:
    a = drugOD[drugOD['County'] == i]
    b = drugSales[drugSales['County'] == i]
    c = weather[weather['County'] == i]
    d = weatherTotal[weatherTotal['County'] == i]
    P, OD, Q, DU, OD100 = 0, 0, 0, 0, 0
    Pq, ODq, Qq, DUq, OD100q = 0, 0, 0, 0, 0
    print('\t"'+i+'" : {')
    if len(d) > 0:
        fips = str(int(d.values[0][1]))
        if len(fips) < 5:
            fips = '0'+fips
            kill = 1
        print('\t\t"fips" : "'+fips+'",')
    for y in range(2006,2012):
        print('\t\t"'+str(y)+'" : {')
        dOD = a[a['Year'] == y].values
        dS = b[b['Year'] == y].values
        w = c[c['Year'] == y].values
        if len(dOD) > 0:
            print('\t\t\t"Population" : '+str(dOD[0][2])+',')
            P += dOD[0][2]
            Pq += 1
        
            print('\t\t\t"Drug Overdoses" : '+str(dOD[0][3])+',')
            OD += dOD[0][3]
            ODq += 1
            comma = ''
            if len(w) > 0 or len(dS) > 0:
                comma = ','
            print('\t\t\t"Overdoses per 100k" : '+str(dOD[0][4])+comma)
            OD100 += dOD[0][4]
            OD100q += 1
        
        if len(dS) > 0:
            print('\t\t\t"Quantity" : '+str(dS[0][1])+',')
            Q += dS[0][1]
            Qq += 1
            comma = ''
            if len(w) > 0:
                comma = ','
            print('\t\t\t"Dosage Unit" : '+str(dS[0][2])+comma)
            DU += dS[0][2]
            DUq += 1
        if len(w) > 0:
            print('\t\t\t"Temperature" : '+str(w[0][3]))
        print('\t\t},')
    if Pq > 0:
        P /= Pq
    if ODq > 0:
        OD /= ODq
    if Qq > 0:
        Q /= Qq
    if DUq > 0:
        DU /= DUq
    print('\t\t"Average" : {')
    if P != 0:
        print('\t\t\t"Population" : '+str(round(P))+',')
    if OD != 0:
        comma = ''
        if Q != 0 or len(d.values) > 0:
            comma = ','
        print('\t\t\t"Drug Overdoses" : '+str(round(OD))+comma)
    if Q != 0:
        print('\t\t\t"Quantity" : '+str(round(Q))+',')
    comma = ''
    if len(d.values) > 0:
        comma = ','
    if DU != 0:
        print('\t\t\t"Dosage Unit" :'+str(round(DU))+comma)
    if len(d.values) > 0:
        print('\t\t\t"Temperature" : '+str(d.values[0][2]))
    print('\t\t},')
    print('\t\t"Ranking" : {')
    print('\t\t\t"Population" : ""'+',')
    print('\t\t\t"Drug Overdoses" : ""'+',')
    print('\t\t\t"Quantity" : ""'+',')
    print('\t\t\t"Dosage Unit" : ""'+',')
    print('\t\t\t"Temperature" : ""')
    print('\t\t}')
    print('\t},')
    # break
print('}')
