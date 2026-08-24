import pg from 'pg';
import { readFileSync, appendFileSync } from 'node:fs';
const log=(m)=>{appendFileSync('/tmp/probe.log',m+'\n');console.log(m);};
const env=Object.fromEntries(readFileSync('/home/ubuntu/Documents/startups/.env','utf8').split('\n').map(l=>l.match(/^([A-Z0-9_]+)=(.*)$/)?.slice(1,3)).filter(Boolean));
const ref='xafspnuqhcpznrihtmvq', pw=env.SUPABASE_DB_PASSWORD;
const tries=[];
for(const pfx of ['aws-1','aws-0']) for(const r of ['eu-west-1','eu-west-2','eu-central-1','us-east-1']) for(const port of [5432,6543]) tries.push({h:`${pfx}-${r}.pooler.supabase.com`,port,u:'postgres.'+ref});
for(const t of tries){
 const c=new pg.Client({host:t.h,port:t.port,user:t.u,password:pw,database:'postgres',ssl:{rejectUnauthorized:false},connectionTimeoutMillis:5000});
 try{ await c.connect(); log('SUCCESS '+t.h+':'+t.port); const r=await c.query('select count(*)::int n from public.attributes'); log('attributes rows: '+r.rows[0].n); await c.end(); process.exit(0);}catch(e){ log('fail '+(t.h+':'+t.port)+' -> '+String(e.message).slice(0,70)); try{await c.end()}catch{}}
}
log('ALL_FAILED');
