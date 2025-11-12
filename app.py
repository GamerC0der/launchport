import http.client as h,json
c=h.HTTPSConnection('fdo.rocketlaunch.live')
c.request('GET','/json/launches/next/5')
r=c.getresponse()
d=json.loads(r.read().decode())
for f in['valid_auth','count','limit','total','last_page']:d.pop(f,None)
for l in d['result']:
 for f in['id','cospar_id','slug','est_date','tags','weather_summary','weather_temp','weather_condition','weather_wind_mph','weather_icon','weather_updated','quicktext','media','result','suborbital','modified']:l.pop(f,None)
 if'sort_date'in l:l['date']=l.pop('sort_date')
 if'date_str'in l:l['formatted_date']=l.pop('date_str')
 if'provider'in l and isinstance(l['provider'],dict):l['provider']=l['provider'].get('name','')
 if'vehicle'in l and isinstance(l['vehicle'],dict):l['vehicle']=l['vehicle'].get('name','')
 def rm_id(o):[o.pop(k,None)for k in list(o.keys())if k=='id'];[rm_id(v)if isinstance(v,dict)else[v.remove(i)for i in v if isinstance(i,dict)]if isinstance(v,list)else None for v in o.values()]
 rm_id(l)
json.dump(d,open('l.json','w'),indent=2)
