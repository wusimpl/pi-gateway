import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { createFeishuDocsService } from './dist/feishu/doc-service.js';

const documentId = 'Gdnmd7qVHoyWrGxwnQPcAeO8nOd';
const imageDir = '/tmp/pdf_figs/crops';
const client = new lark.Client({
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
  domain: lark.Domain.Feishu,
  appType: lark.AppType.SelfBuild,
});
const service = createFeishuDocsService(client, { feishuDomain: 'feishu' });
const meta = await client.docx.v1.document.get({ path: { document_id: documentId } });
let revisionId = meta.data?.document?.revision_id;

const items = [
  { afterIndex: 13, file: 'Figure_1_Token_Efficiency.jpg', caption: '图 1｜Token 效率与选定基准平均得分。左图比较 800×800 图像输入下各模型 token 消耗；右图比较选定 7 个相关基准的平均表现。' },
  { afterIndex: 17, file: 'Figure_2_Architecture.jpg', caption: '图 2｜模型架构与训练流程。模型基于 DeepSeek-V4-Flash 与 DeepSeek-ViT，并通过预训练、专门化 SFT/RL、统一 RFT 和在策略蒸馏整合视觉基元能力。' },
  { afterIndex: 52, file: 'Figure_3_Counting.jpg', caption: '图 3｜计数任务冷启动数据示例。模型先分解意图，再用边界框锚定相关实体，最后进行系统计数。' },
  { afterIndex: 58, file: 'Figure_4_Spatial_Reasoning.jpg', caption: '图 4｜空间推理冷启动数据示例。模型通过视觉基元锚定实体，并完成多跳逻辑推理。' },
  { afterIndex: 64, file: 'Figure_5_Maze_Navigation.jpg', caption: '图 5｜迷宫导航任务示例。模型先定位起点和终点，再以 DFS 方式探索路径。' },
  { afterIndex: 69, file: 'Figure_6_Path_Tracing.jpg', caption: '图 6｜路径追踪任务示例。模型定位起点和终点，并用点序列追踪线条。' },
  { afterIndex: 125, file: 'Table_1_Model_Comparison.jpg', caption: '表 1｜与前沿模型的比较。所有模型使用同一组提示词通过各自 API 评估，展示计数、空间推理、通用 VQA 和拓扑推理等任务表现。' },
  { afterIndex: 128, file: 'Figure_7_Grounding_1.jpg', caption: '图 7｜用边界框进行 grounding 的示例一：细粒度计数与反常识视觉问答。' },
  { afterIndex: 128, file: 'Figure_8_Grounding_2.jpg', caption: '图 8｜用边界框进行 grounding 的示例二：结合世界知识的视觉问答与可执行建议。' },
  { afterIndex: 128, file: 'Figure_9_Grounding_3.jpg', caption: '图 9｜用边界框进行 grounding 的示例三：图像幽默理解、密室逃脱指导与计数。' },
  { afterIndex: 130, file: 'Figure_10_Pointing.jpg', caption: '图 10｜用点进行 pointing 的示例：迷宫导航与路径追踪。' },
];

function imageMarkdown(file, caption) {
  const data = readFileSync(`${imageDir}/${file}`).toString('base64');
  return `**${caption}**\n\n![${file}](data:image/jpeg;base64,${data})`;
}

function sanitizeConvertedBlocks(blocks) {
  return (blocks ?? []).map((block) => {
    const next = { ...block };
    delete next.parent_id;
    return next;
  });
}

async function convertSnippet(file, caption) {
  const content = imageMarkdown(file, caption);
  const converted = await client.docx.v1.document.convert({
    data: { content_type: 'markdown', content },
  });
  const childIds = converted.data?.first_level_block_ids ?? [];
  const descendants = sanitizeConvertedBlocks(converted.data?.blocks ?? []);
  if (!childIds.length || !descendants.length) throw new Error(`convert failed for ${file}`);
  return { childIds, descendants };
}

async function collectImageBlockIds(rootBlockIds) {
  const imageBlockIds = [];
  for (const rootId of rootBlockIds) {
    const rootResp = await client.docx.v1.documentBlock.get({ path: { document_id: documentId, block_id: rootId } });
    const root = rootResp.data?.block;
    if (root?.block_type === 27) imageBlockIds.push(rootId);
    const iterator = await client.docx.v1.documentBlockChildren.getWithIterator({
      path: { document_id: documentId, block_id: rootId },
      params: { with_descendants: true, page_size: 200 },
    });
    for await (const page of iterator) {
      for (const block of page?.items ?? []) {
        if (block.block_type === 27 && block.block_id) imageBlockIds.push(block.block_id);
      }
    }
  }
  return imageBlockIds;
}

async function uploadAndReplace(imageBlockId, file) {
  const buf = readFileSync(`${imageDir}/${file}`);
  const upload = await client.drive.v1.media.uploadAll({
    data: {
      file_name: basename(file),
      parent_type: 'docx_image',
      parent_node: imageBlockId,
      size: buf.length,
      extra: JSON.stringify({ drive_route_token: documentId }),
      file: buf,
    },
  });
  const token = upload?.file_token;
  if (!token) throw new Error(`upload failed for ${file}`);
  const resp = await client.docx.v1.documentBlock.batchUpdate({
    path: { document_id: documentId },
    params: { document_revision_id: revisionId, client_token: crypto.randomUUID() },
    data: { requests: [{ block_id: imageBlockId, replace_image: { token } }] },
  });
  revisionId = resp.data?.document_revision_id ?? revisionId;
}

// Work from bottom to top so original root indexes remain valid.
for (const item of [...items].sort((a,b)=>b.afterIndex-a.afterIndex)) {
  console.log(`Inserting ${item.file} after original index ${item.afterIndex}`);
  const { childIds, descendants } = await convertSnippet(item.file, item.caption);
  const createResp = await client.docx.v1.documentBlockDescendant.create({
    path: { document_id: documentId, block_id: documentId },
    params: { document_revision_id: revisionId, client_token: crypto.randomUUID() },
    data: { children_id: childIds, descendants, index: item.afterIndex + 1 },
  });
  revisionId = createResp.data?.document_revision_id ?? revisionId;
  const insertedRoots = (createResp.data?.children ?? []).map(b=>b.block_id).filter(Boolean);
  const imageBlockIds = await collectImageBlockIds(insertedRoots);
  if (imageBlockIds.length !== 1) throw new Error(`${item.file}: expected 1 image block, got ${imageBlockIds.length}`);
  await uploadAndReplace(imageBlockIds[0], item.file);
}

console.log('done revision', revisionId);
