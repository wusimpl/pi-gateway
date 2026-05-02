import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
const client = new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
const documentId='Gdnmd7qVHoyWrGxwnQPcAeO8nOd';
for (const id of ['doxcnLhBZXRm6xH9SfEniDAWUbd','doxcnJQupNfpemGrE6sCuFHLpPh']) {
  const root=await client.docx.v1.documentBlock.get({path:{document_id:documentId,block_id:id}});
  console.log('root',id, JSON.stringify(root.data?.block,null,2).slice(0,2000));
  const iterator=await client.docx.v1.documentBlockChildren.getWithIterator({path:{document_id:documentId,block_id:id},params:{with_descendants:true,page_size:200}});
  for await (const page of iterator) console.log('children',JSON.stringify(page,null,2).slice(0,4000));
}
