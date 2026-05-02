import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
import { readFileSync } from 'node:fs';
const client = new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
const created=await client.docx.v1.document.create({data:{title:'tmp image insert test'}});
const doc=created.data.document.document_id;
let rev=created.data.document.revision_id;
const data=readFileSync('/tmp/pdf_figs/crops/Figure_1_Token_Efficiency.jpg').toString('base64');
const conv=await client.docx.v1.document.convert({data:{content_type:'markdown',content:`**cap**\n\n![x](data:image/jpeg;base64,${data})`}});
function sanitize(blocks){return (blocks??[]).map(b=>{const n={...b}; delete n.parent_id; return n;});}
console.log('conv types',conv.data.blocks.map(b=>[b.block_id,b.block_type,!!b.image]));
const create=await client.docx.v1.documentBlockDescendant.create({path:{document_id:doc,block_id:doc},params:{document_revision_id:rev,client_token:crypto.randomUUID()},data:{children_id:conv.data.first_level_block_ids,descendants:sanitize(conv.data.blocks),index:-1}});
console.log('create children',create.data.children.map(b=>[b.block_id,b.block_type,!!b.image]));
rev=create.data.document_revision_id;
const roots=create.data.children.map(b=>b.block_id);
for (const id of roots){
 const block=await client.docx.v1.documentBlock.get({path:{document_id:doc,block_id:id}});
 console.log('get root',id,block.data.block.block_type,!!block.data.block.image, JSON.stringify(block.data.block.image||block.data.block.text).slice(0,300));
}
