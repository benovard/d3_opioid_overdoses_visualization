import pandas as pd

# this is some of the worst python I have ever written...

def avg(lst):
    count = 0
    val = 0
    for k in lst:
        if str(k) != 'nan':
            count += 1
            val += k
    if count > 0:
        return val / count
    else:
        return float('nan')

drugOD = pd.read_csv(r'drug_overdoses_2006-2016_cleaned.csv',header=0,usecols=['Year','State','County','Population','Deaths','Death Rate per 100k'])
drugOD['Index'] = (drugOD['County'] + drugOD['State']).str.upper()
drugOD = drugOD.drop(['State','County'],axis=1)
drugOD = drugOD[drugOD['Year'] < 2012]

drugSales = pd.read_csv(r'total_data.csv',header=0,usecols=['BUYER_STATE','BUYER_COUNTY','YEAR','QUANTITY','DOSAGE_UNIT'])
drugSales['Index'] = drugSales['BUYER_COUNTY'] + drugSales['BUYER_STATE']
drugSales = drugSales.drop(['BUYER_COUNTY','BUYER_STATE'],axis=1)
drugSales = drugSales.rename(columns={'YEAR':'Year','QUANTITY':'Quantity','DOSAGE_UNIT':'Dosage Unit'})

weather = pd.read_csv(r'NALDAS_DAILY-MAX-AIR-TEMP-AVG.tsv',sep='\t',header=0,usecols=['Notes','County','County Code','Year','Year Code','Avg Daily Max Air Temperature (F)'])
weather['Index'] = (weather['County'].str.split(',').str[0].str.split(' ').str[:-1].str.join('') + weather['County'].str[-2:]).str.upper()
weather = weather.drop(weather.tail(18).index)
weather = weather.drop('Year Code',axis=1)
weather = weather.rename(columns={'Avg Daily Max Air Temperature (F)':'Temp'})
weatherTotal = weather[weather['Notes'] == 'Total']
weather = weather.drop(['Notes','County','County Code'],axis=1)
weather = weather.dropna()
weatherTotal = weatherTotal.drop(['Notes','Year'],axis=1)

# print(drugOD)
# print(drugSales)
# print(weather)
# print(weatherTotal)

allCounties = pd.read_csv(r'county_fips_master.csv',header=0,usecols=['fips','county_name','state_name','state_abbr'],encoding='iso-8859-1')
temp = [(k[0],k[1],k[2],k[3],y) for k in allCounties[['fips','county_name','state_abbr','state_name']].values for y in range(2006,2012)]
combinedDF = pd.DataFrame(temp,columns=['FIPS','County','Abbr','State','Year'])
combinedDF['Pretty Name'] = combinedDF['County'] + ', ' + combinedDF['State']
combinedDF['Index'] = (combinedDF['County'].str.split(' ').str[:-1].str.join('') + combinedDF['Abbr']).str.upper()
combinedDF = combinedDF.merge(drugOD,how='outer',on=['Index','Year'])
combinedDF = combinedDF.merge(drugSales,how='outer',on=['Index','Year'])
combinedDF = combinedDF.merge(weather,how='outer',on=['Index','Year'])
cols = combinedDF.columns.tolist()
cols = ['FIPS','Index','County','State','Abbr','Pretty Name','Year','Population','Deaths','Death Rate per 100k','Quantity','Temp']
combinedDF = combinedDF[cols]
combinedDF = combinedDF.dropna(subset=['FIPS'])
combinedDF['FIPS'] = combinedDF['FIPS'].map(str).str[:-2]

dODCounties = drugOD['Index'].tolist()
dSCounties = drugSales['Index'].tolist()
wCounties = weather['Index'].tolist()
aCounties = combinedDF['Index'].tolist()
counties = set().union(dODCounties, dSCounties, wCounties, aCounties)

avgDF = combinedDF.drop_duplicates(subset=['Index'])
avgDF = avgDF.drop(['Year'],axis=1)
for i in counties:
    avgDF.loc[avgDF['Index'] == i, 'Population'] = avg(combinedDF[combinedDF['Index'] == i]['Population'].tolist())
    avgDF['Population'] = avgDF['Population'].rank()
    avgDF.loc[avgDF['Index'] == i, 'Deaths'] = avg(combinedDF[combinedDF['Index'] == i]['Deaths'].tolist())
    avgDF['Deaths'] = avgDF['Deaths'].rank()
    avgDF.loc[avgDF['Index'] == i, 'Death Rate per 100k'] = avg(combinedDF[combinedDF['Index'] == i]['Death Rate per 100k'].tolist())
    avgDF['Death Rate per 100k'] = avgDF['Death Rate per 100k'].rank()
    avgDF.loc[avgDF['Index'] == i, 'Quantity'] = avg(combinedDF[combinedDF['Index'] == i]['Quantity'].tolist())
    avgDF['Quantity'] = avgDF['Quantity'].rank()
    avgDF.loc[avgDF['Index'] == i, 'Temp'] = avg(combinedDF[combinedDF['Index'] == i]['Temp'].tolist())
    avgDF['Temp'] = avgDF['Temp'].rank()

output = 'y'

if output == 'y':
    print('{')
for i in counties:
    county = combinedDF[combinedDF['Index'] == i]
    temp = county['FIPS'].tolist()
    drugoverdoses, overdoses100k, sales, temperature = 0, 0, 0, 0
    values = [drugoverdoses, overdoses100k, sales, temperature]
    fips = 'NaN'
    if len(temp) > 0:
        fips = temp[0]
        if len(fips) > 5:
            fips = '0' + fips
    if fips == 'NaN':
        continue
    if output == 'y':
        print('\t"'+i+'" : {')
        print('\t\t"fips" : "'+fips+'",')
    for index,row in county.iterrows():
        population = row['Population']
        drugoverdoses = row['Deaths']
        overdoses100k = row['Death Rate per 100k']
        sales = row['Quantity']
        temperature = row['Temp']
        comma = [',' if str(k) != 'nan' else '' for k in values]
        if output == 'y':
            print('\t\t"'+str(row['Year'])+'" : {')
            if str(row['Population']) != 'nan':
                print('\t\t\t"Population" : '+str(row['Population'])+comma[0])
            if str(row['Deaths']) != 'nan':
                print('\t\t\t"Drug Overdoses" : '+str(row['Deaths'])+comma[1])
            if str(row['Death Rate per 100k']) != 'nan':
                print('\t\t\t"Overdoses per 100k" : '+str(row['Death Rate per 100k'])+comma[2])
            if str(row['Quantity']) != 'nan':
                print('\t\t\t"Quantity" : '+str(row['Quantity'])+comma[3])
            if str(row['Temp']) != 'nan':
                print('\t\t\t"Temperature" : '+str(row['Temp']))
            print('\t\t},')
    population = avg(county['Population'].tolist())
    drugoverdoses = avg(county['Deaths'].tolist())
    overdoses100k = avg(county['Death Rate per 100k'].tolist())
    sales = avg(county['Quantity'].tolist())
    temperature = avg(county['Temp'].tolist())
    rankings = avgDF[avgDF['Index'] == i]
    comma = [',' if str(k) != 'nan' else '' for k in values]
    if output == 'y':
        print('\t\t"Average" : {')
        if str(population) != 'nan':
            print('\t\t\t"Population" : '+str(population)+comma[0])
        if str(drugoverdoses) != 'nan':
            print('\t\t\t"Drug Overdoses" : '+str(drugoverdoses)+comma[1])
        if str(overdoses100k) != 'nan':
            print('\t\t\t"Overdoses per 100k" : '+str(overdoses100k)+comma[2])
        if str(sales) != 'nan':
            print('\t\t\t"Quantity" : '+str(sales)+comma[3])
        if str(temperature) != 'nan':
            print('\t\t\t"Temperature" : '+str(temperature))
        print('\t\t},')
        population = rankings['Population'].tolist()[0]
        drugoverdoses = rankings['Deaths'].tolist()[0]
        overdoses100k = rankings['Death Rate per 100k'].tolist()[0]
        sales = rankings['Quantity'].tolist()[0]
        temperature = rankings['Temp'].tolist()[0]
        comma = [',' if str(k) != 'nan' else '' for k in values]
        print('\t\t"Ranking" : {')
        if str(population) != 'nan':
            print('\t\t\t"Population" : '+str(population)+comma[0])
        if str(drugoverdoses) != 'nan':
            print('\t\t\t"Drug Overdoses" : '+str(drugoverdoses)+comma[1])
        if str(overdoses100k) != 'nan':
            print('\t\t\t"Overdoses per 100k" : '+str(overdoses100k)+comma[2])
        if str(sales) != 'nan':
            print('\t\t\t"Quantity" : '+str(sales)+comma[3])
        if str(temperature) != 'nan':
            print('\t\t\t"Temperature" : '+str(temperature))
        print('\t\t}')
        print('\t},')

if output == 'y':
    print('}')
if output == 'n':
    print(combinedDF.head(30))
    print(avgDF.head(30))
