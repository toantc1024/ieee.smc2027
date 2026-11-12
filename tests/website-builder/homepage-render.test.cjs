const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');
const root = process.cwd();
const ts = require(path.join(root, 'node_modules/typescript'));
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},fileName:filename}).outputText, filename);
let homePage, user;
function PublicPageRenderer() { return null; }
const originalLoad=Module._load;
Module._load=function(request,parent,...rest) {
  if (request==='@/services') return {cmsService:{getPageByIdOrSlug:async()=>homePage}};
  if (request==='@/lib') return {withTimeout:async(promise)=>promise};
  if (request==='@/lib/auth') return {getCurrentUser:async()=>user};
  if (request==='@/lib/page-access') return originalLoad.call(this,path.join(root,'src/lib/page-access.ts'),parent,...rest);
  if (request==='next/navigation') return {notFound:()=>{throw new Error('NOT_FOUND')}};
  if (request==='@/app/(public)/[slug]/public-page-renderer') return {PublicPageRenderer};
  if (request.startsWith('@/components/sections/')) return new Proxy({}, {get:()=>()=>null});
  return originalLoad.call(this,request,parent,...rest);
};
const Home=require(path.join(root,'src/app/page.tsx')).default;
const invoke=(preview)=>Home({searchParams:Promise.resolve({preview})});
(async()=>{
 homePage={is_published:true,blocks:[]}; user=null;
 const empty=await invoke(undefined); assert.equal(empty.type,PublicPageRenderer); assert.deepEqual(empty.props.blocks,[]);
 homePage={is_published:false,blocks:[{id:'private',type:'Text',props:{content:'private'}}]};
 await assert.rejects(invoke(undefined),/NOT_FOUND/); await assert.rejects(invoke('true'),/NOT_FOUND/);
 user={role:'USER'}; await assert.rejects(invoke('1'),/NOT_FOUND/);
 user={role:'ADMIN'}; await assert.rejects(invoke(undefined),/NOT_FOUND/); const preview=await invoke('1'); assert.equal(preview.props.blocks[0].id,'private');
 homePage=null; const fallback=await invoke(undefined); assert.equal(fallback.type,'div');
 console.log('Homepage draft access, empty saved page, admin preview, and missing-page fallback passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
