import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
import { createFeishuDocsService } from './src/feishu/doc-service.ts';

const documentId = 'Gdnmd7qVHoyWrGxwnQPcAeO8nOd';
const client = new lark.Client({
  appId: process.env.FEISHU_APP_ID!,
  appSecret: process.env.FEISHU_APP_SECRET!,
  domain: lark.Domain.Feishu,
  appType: lark.AppType.SelfBuild,
});
const service = createFeishuDocsService(client as any, { feishuDomain: 'feishu' });
const children = await service.listRootChildren({ document_id: documentId });
function blockText(b: any): string {
  const parts: string[] = [];
  const walk = (x: any) => {
    if (typeof x === 'string') { parts.push(x); return; }
    if (!x || typeof x !== 'object') return;
    if (typeof x.content === 'string') parts.push(x.content);
    if (typeof x.text === 'string') parts.push(x.text);
    if (Array.isArray(x)) for (const i of x) walk(i);
    else for (const v of Object.values(x)) walk(v);
  };
  walk(b);
  return [...new Set(parts)].join(' ').replace(/\s+/g, ' ').slice(0, 220);
}
console.log('children', children.length);
for (let i=0;i<children.length;i++) {
  const t = blockText(children[i]);
  if (/图 1|图 2|图 3|图 4|图 5|图 6|图 7|图 8|图 9|图 10|表 1|3\.3|3\.4|2\.4\.1|2\.4\.2|2\.4\.3|2\.4\.4/.test(t)) {
    console.log(i, 'type', children[i].block_type, t);
  }
}
