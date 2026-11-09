// Requires npm run build. Uses only fixture credentials on loopback.
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const assert=require('node:assert/strict');
const port=3107,base=`http://127.0.0.1:${port}`;
async function run(configured){
 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',SITE_PASSWORD:configured?'fixture-study-password':'',SESSION_SECRET:configured?'fixture-session-secret-for-app-smoke-tests-only':'',GROQ_API_KEY:''},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<60;i++){try{const r=await fetch(base);if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}
  assert.ok(ready,'Production server is ready');
  assert.equal((await fetch(`${base}/api/content?kind=vocabulary`)).status,401,'Private content requires authentication');
  const login=password=>fetch(`${base}/api/auth`,{method:'POST',headers:{Origin:base},body:new URLSearchParams({password})});
  if(!configured){assert.equal((await login('fixture')).status,503);return;}
  assert.equal((await login('wrong-password')).status,401);
  assert.equal((await fetch(`${base}/api/auth`,{method:'POST',body:new URLSearchParams({password:'fixture-study-password'})})).status,403,'Login requires same origin');
  const response=await login('fixture-study-password');assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie').split(';')[0];
  assert.match(response.headers.get('set-cookie'),/HttpOnly/i);
  const headers={Cookie:cookie};
  const lesson=await fetch(`${base}/api/content?kind=lesson&id=concept-present-perfect`,{headers});
  assert.equal(lesson.status,200);assert.match(lesson.headers.get('cache-control'),/no-store/);
  const detail=await lesson.json();assert.ok(detail.documents.length);assert.ok(detail.practices.length);
  const words=await (await fetch(`${base}/api/content?kind=vocabulary&q=challenge`,{headers})).json();assert.ok(words.items.some(w=>w.word==='challenge'));
  assert.equal((await fetch(`${base}/api/content?kind=lesson&id=missing`,{headers})).status,404);
  assert.equal((await fetch(`${base}/api/tutor`,{method:'POST',headers:{...headers,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({lessonId:'concept-present-perfect',question:'fixture'})})).status,503,'Unconfigured tutor fails honestly');
 }finally{child.kill('SIGTERM');if(child.exitCode===null)await once(child,'exit');}
}
(async()=>{await run(false);await run(true);console.log('Production smoke checks passed: closed default, login, protected content, search, lesson, tutor configuration.');})().catch(e=>{console.error(e);process.exitCode=1;});
