import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
const documentId='Gdnmd7qVHoyWrGxwnQPcAeO8nOd';
const imageDir='/tmp/pdf_figs/crops';
const client=new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
let rev=(await client.docx.v1.document.get({path:{document_id:documentId}})).data?.document?.revision_id;
const items=[
  { afterIndex: 13, file: 'Figure_1_Token_Efficiency.jpg', caption: '图 1｜Token 效率与选定基准平均得分。左图比较 800×800 图像输入下各模型 token 消耗；右图比较选定 7 个相关基准的平均表现。' },
  { afterIndex: 17, file: 'Figure_2_Architecture.jpg', caption: '图 2｜模型架构与训练流程。模型基于 DeepSeek-V4-Flash 与 DeepSeek-ViT，并通过预训练、专门化 SFT/RL、统一 RFT 和在策略蒸馏整合视觉基元能力。' },
  { afterIndex: 52, file: 'Figure_3_Counting.jpg', caption: '图 3｜计数任务冷启动数据示例。模型先分解意图，再用边界框锚定相关实体，最后进行系统计数。' },
  { afterIndex: 58, file: 'Figure_4_Spatial_Reasoning.jpg', caption: '图 4｜空间推理冷启动数据示例。模型通过视觉基元锚定实体，并完成多跳逻辑推理。' },
  { afterIndex: 64, file: 'Figure_5_Maze_Navigation.jpg', caption: '图 5｜迷宫导航任务示例。模型先定位起点和终点，再以 DFS 方式探索路径。' },
  { afterIndex: 69, file: 'Figure_6_Path_Tracing.jpg', caption: '图 6｜路径追踪任务示例。模型定位起点和终点，并用点序列追踪线条。' },
  { afterIndex: 125, file: 'Table_1_Model_Comparison.jpg', caption: '表 1｜与前沿模型的比较。所有模型使用同一组提示词通过各自 API 评估，展示计数、空间推理、通用 VQA 和拓扑推理等任务表现。' },
  { afterIndex: 128, file: 'Figure_7_Grounding_1.jpg', caption: '图 7｜用边界框进行 grounding 的示例一：细粒度计数与反常识视觉问答。', subOrder: 0 },
  { afterIndex: 128, file: 'Figure_8_Grounding_2.jpg', caption: '图 8｜用边界框进行 grounding 的示例二：结合世界知识的视觉问答与可执行建议。', subOrder: 1 },
  { afterIndex: 128, file: 'Figure_9_Grounding_3.jpg', caption: '图 9｜用边界框进行 grounding 的示例三：图像幽默理解、密室逃脱指导与计数。', subOrder: 2 },
];
function sanitize(blocks){return (blocks??[]).map(b=>{const n={...b}; delete n.parent_id; return n;});}
async function convert(item){
 const data=readFileSync(`${imageDir}/${item.file}`).toString('base64');
 const content=`**${item.caption}**\n\n![${item.file}](data:image/jpeg;base64,${data})`;
 const conv=await client.docx.v1.document.convert({data:{content_type:'markdown',content}});
 return {childIds:conv.data?.first_level_block_ids??[],descendants:sanitize(conv.data?.blocks??[])};
}
async function replaceImage(imageBlockId,file){
 const buf=readFileSync(`${imageDir}/${file}`);
 const upload=await client.drive.v1.media.uploadAll({data:{file_name:basename(file),parent_type:'docx_image',parent_node:imageBlockId,size:buf.length,extra:JSON.stringify({drive_route_token:documentId}),file:buf}});
 if(!upload?.file_token) throw new Error('upload failed '+file);
 const resp=await client.docx.v1.documentBlock.batchUpdate({path:{document_id:documentId},params:{document_revision_id:rev,client_token:crypto.randomUUID()},data:{requests:[{block_id:imageBlockId,replace_image:{token:upload.file_token}}]}});
 rev=resp.data?.document_revision_id??rev;
}
// For same afterIndex, insert in reverse desired order at the same point so final order is 7,8,9.
const sorted=[...items].sort((a,b)=> b.afterIndex-a.afterIndex || (b.subOrder??0)-(a.subOrder??0));
for(const item of sorted){
 console.log('insert',item.file,'after',item.afterIndex);
 const {childIds,descendants}=await convert(item);
 if(!childIds.length) throw new Error('convert empty '+item.file);
 const create=await client.docx.v1.documentBlockDescendant.create({path:{document_id:documentId,block_id:documentId},params:{document_revision_id:rev,client_token:crypto.randomUUID()},data:{children_id:childIds,descendants,index:item.afterIndex+1}});
 rev=create.data?.document_revision_id??rev;
 const roots=(create.data?.children??[]).filter(b=>b.block_id);
 const images=roots.filter(b=>b.block_type===27);
 if(images.length!==1) throw new Error(`${item.file}: expected one image root, got ${images.length}; roots=${roots.map(b=>b.block_type).join(',')}`);
 await replaceImage(images[0].block_id,item.file);
}
console.log('done',rev);
