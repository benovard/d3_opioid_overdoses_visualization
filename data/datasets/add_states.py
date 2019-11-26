import pandas as pd
import re

def insert(string, index, value):
    return string[:index] + value + string[index:]

fips = pd.read_csv(r'county_fips_master.csv',header=0,usecols=['fips','state_abbr','county_name','state_name'],encoding='iso-8859-1')
fips['id'] = (fips['county_name'].str.split(' ').str[:-1].str.join('')+fips['state_abbr']).str.upper()
topo = open('topojson-counties.json','r+')
topo = topo.read()

#print(fips)

regex = '"id":"(\d{5})","properties":{"name":"([A-z\s]*)(")}'

toposplit = re.finditer(regex,topo)

k = 0
for i in toposplit:
    fipscode = int(i.groups()[0])
    state = ',"state":"'+fips[fips['fips'] == fipscode].values[0][3]+'"'
    statecode = ',"state_short":"'+fips[fips['fips'] == fipscode].values[0][2]+'"'
    ident = ',"id":"'+fips[fips['fips'] == fipscode].values[0][4]+'"'
    string = ''.join([state,statecode,ident])
#    print("id:",fipscode)
#    print(" i:",i.group())
#    print(" groups:",i.groups())
#    print(" newstring:",string)
    j = re.search(i.group(),topo)
#    print(" j:",j.group())
    topo = insert(topo, j.span(0)[1]-1, string)
    k += 1

print(topo)
