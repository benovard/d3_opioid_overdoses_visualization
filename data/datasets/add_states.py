import pandas as pd
import re

def insert(string, index, value):
    return string[:index] + value + string[index:]

fips = pd.read_csv(r'county_fips_master.csv',header=0,usecols=['fips','state_abbr'])
topo = open('topojson-counties.json','r+')
topo = topo.read()
#print(type(topo))

#print(fips)

regex = '"id":"(\d{5})","properties":{"name":"[A-Z][a-z]*(")}'

toposplit = re.finditer(regex,topo)

k = 0
for i in toposplit:
    a = i.span(1)
    b = i.span(2)
    fipscode = i.groups()[0]
#    print(k,i.group(),i.span(0),i.span(1))
#    print(" ",topo[a[0]:a[1]])
#    print(" ",i.groups())
    state = ',"state":"'+fips[fips['fips'] == int(fipscode)].values[0][1]+'"'
    topo = insert(topo, b[1]+k*len(state), state)
    k += 1

print(topo)
