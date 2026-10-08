#!/usr/bin/env node
// Read a completed picker from an existing real Chrome tab. No navigation or tab closing.
'use strict';
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const {parseArgs} = require('node:util');
(async()=>{
 const {values} = parseArgs({options:{url:{type:'string'},output:{type:'string'},cdp:{type:'string',default:'http://127.0.0.1:9222'}}});
 if(!values.url || !values.output) throw new Error('Usage: read_review.js --url <exact picker URL> --output <selections.json> [--cdp <endpoint>]');
 const browser=await chromium.connectOverCDP(values.cdp);
 const matches=browser.contexts().flatMap(c=>c.pages()).filter(p=>p.url()===values.url);
 if(matches.length!==1)throw new Error(`Expected one review tab at ${values.url}; found ${matches.length}. Use its exported JSON or identify the intended tab.`);
 const data=await matches[0].evaluate(()=>{
  if(!window.handPickReview?.exportSelections)throw new Error('This tab is not a data-hand-picking review.');
  return window.handPickReview.exportSelections();
 });
 const allowed=new Set(['pending','keep','delete','highlight']);
 if(data.version!==1||typeof data.datasetId!=='string'||!Array.isArray(data.selections)||!data.selections.length)throw new Error('Invalid review snapshot.');
 const ids=new Set();
 for(const row of data.selections){
  if(typeof row.id!=='string'||ids.has(row.id)||!allowed.has(row.decision)||typeof row.notes!=='string')throw new Error('Invalid or duplicate selection.');
  ids.add(row.id);
 }
 fs.mkdirSync(path.dirname(path.resolve(values.output)),{recursive:true});
 fs.writeFileSync(values.output,JSON.stringify(data,null,2)+'\n');
 const counts={};for(const row of data.selections)counts[row.decision]=(counts[row.decision]||0)+1;
 console.log(JSON.stringify({output:values.output,datasetId:data.datasetId,counts},null,2));
 // Detach by ending this script; never call browser.close() on the shared Chrome.
})().then(async()=>{await new Promise(resolve=>process.stdout.write('',resolve));process.exit(0)}).catch(async error=>{console.error(error.message);await new Promise(resolve=>process.stderr.write('',resolve));process.exit(1)});
