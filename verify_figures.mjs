import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
import { createFeishuDocsService } from './dist/feishu/doc-service.js';
const documentId='Gdnmd7qVHoyWrGxwnQPcAeO8nOd';
const client=new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
const service=createFeishuDocsService(client,{feishuDomain:'feishu'});
const children=await service.listRootChildren({document_id:documentId});
function text(b){const parts=[];const walk=x=>{if(typeof x==='string'){if(x.trim())parts.push(x);return} if(!x||typeof x!=='object')return; if(Array.isArray(x)){x.forEach(walk);return} if(typeof x.content==='string')parts.push(x.content); if(typeof x.text==='string')parts.push(x.text); Object.values(x).forEach(walk)};walk(b);return [...new Set(parts)].join(' ').replace(/\s+/g,' ').slice(0,140)}
console.log('root blocks',children.length);
let images=0;
for(let i=0;i<children.length;i++){
 const b=children[i];
 const t=text(b);
 if(b.block_type===27 || /^图 \d|^表 1/.test(t)) {
   if(b.block_type===27) images++;
   console.log(i, 'type', b.block_type, b.block_type===27 ? `image token=${b.image?.token?'yes':'NO'} size=${b.image?.width}x${b.image?.height}` : t);
 }
}
console.log('image count',images);
