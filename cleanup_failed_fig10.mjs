import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
const documentId='Gdnmd7qVHoyWrGxwnQPcAeO8nOd';
const client=new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
const meta=await client.docx.v1.document.get({path:{document_id:documentId}});
const rev=meta.data?.document?.revision_id;
const resp=await client.docx.v1.documentBlockChildren.batchDelete({
  path:{document_id:documentId,block_id:documentId},
  params:{document_revision_id:rev,client_token:crypto.randomUUID()},
  data:{start_index:131,end_index:133}
});
console.log('deleted failed blocks, revision', resp.data?.document_revision_id);
