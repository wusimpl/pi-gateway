import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
import { readFileSync } from 'node:fs';
const client = new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
const data=readFileSync('/tmp/pdf_figs/crops/Figure_10_Pointing.jpg').toString('base64');
const md=`**图 10｜测试**\n\n![图10](data:image/jpeg;base64,${data})`;
console.log('md length', md.length);
const resp = await client.docx.v1.document.convert({data:{content_type:'markdown',content:md}});
console.log(JSON.stringify({first:resp.data?.first_level_block_ids, blocks:(resp.data?.blocks??[]).map(b=>({id:b.block_id,type:b.block_type, hasImage:!!b.image, text:b.text, image:b.image}))},null,2).slice(0,4000));
