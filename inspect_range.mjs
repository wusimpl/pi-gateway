import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
import { createFeishuDocsService } from './dist/feishu/doc-service.js';
const client = new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
const service = createFeishuDocsService(client, {feishuDomain:'feishu'});
const children = await service.listRootChildren({document_id:'Gdnmd7qVHoyWrGxwnQPcAeO8nOd'});
function t(b){const parts=[];const walk=x=>{if(typeof x==='string'){if(x.trim())parts.push(x);return} if(!x||typeof x!=='object')return; if(Array.isArray(x)){x.forEach(walk);return} if(typeof x.content==='string')parts.push(x.content); if(typeof x.text==='string')parts.push(x.text); Object.values(x).forEach(walk)};walk(b);return [...new Set(parts)].join(' ').replace(/\s+/g,' ').slice(0,180)}
for (const [a,b] of [[48,59],[120,131]]) { console.log('---',a,b); for(let i=a;i<=b;i++) console.log(i, children[i]?.block_type, t(children[i])); }
