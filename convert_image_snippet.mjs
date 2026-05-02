import 'dotenv/config';
import * as lark from '@larksuiteoapi/node-sdk';
const client = new lark.Client({appId:process.env.FEISHU_APP_ID,appSecret:process.env.FEISHU_APP_SECRET,domain:lark.Domain.Feishu,appType:lark.AppType.SelfBuild});
const resp = await client.docx.v1.document.convert({data:{content_type:'markdown',content:'![图1](data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==)'}});
console.log(JSON.stringify(resp.data,null,2));
