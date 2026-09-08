import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
function client(){let cookie='';return async(path,body,method='POST',csrf=true)=>{const r=await fetch(origin+path,{method:body===undefined?'GET':method,headers:{...(body===undefined?{}:{'Content-Type':'application/json',...(csrf?{Origin:origin}:{})}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];let data;try{data=await r.json()}catch{throw Error('Non-JSON response: '+r.status)}return {status:r.status,data,cookie:r.headers.get('set-cookie')}}}
const guest=client(),a=client(),b=client(),teacher=client(),secondDevice=client();const suffix=Date.now().toString(36);const name='検証A'+suffix,other='検証B'+suffix;const password='test-'+suffix+'-pass';
assert.equal((await guest('/api/teacher')).status,403);
assert.equal((await guest('/api/account',{action:'register',name,password},'POST',false)).status,400);
const registered=await a('/api/account',{action:'register',name,password});assert.equal(registered.status,200,JSON.stringify(registered.data));assert.match(registered.cookie,/HttpOnly/);assert.match(registered.cookie,/SameSite=Strict/);
assert.equal((await b('/api/account',{action:'register',name,password})).status,400);
assert.equal((await b('/api/account',{action:'register',name:other,password})).status,200);
assert.equal((await a('/api/teacher')).status,403);
let account=(await a('/api/account')).data;assert.equal(account.user.name,name);const state=account.save;state.progress.basic[0]={missions:[true,false,false],challenge:false};let result=await a('/api/progress',{save:state,revision:account.revision},'PUT');assert.equal(result.status,200,JSON.stringify(result.data));
assert.equal((await secondDevice('/api/account',{action:'login',name,password})).status,200);const synced=(await secondDevice('/api/account')).data;assert.equal(synced.save.progress.basic[0].missions[0],true);
assert.equal((await b('/api/account')).data.save.progress.basic[0],undefined);
assert.equal((await a('/api/progress',{save:state,revision:account.revision},'PUT')).status,409);
const tamper=structuredClone(synced.save);tamper.opts.unlockAll=true;tamper.special=[{id:'idea',date:'2026-01-01'}];result=await a('/api/progress',{save:tamper,revision:synced.revision},'PUT');assert.equal(result.status,200);account=(await a('/api/account')).data;assert.equal(account.save.opts.unlockAll,false);assert.equal(account.save.special.length,0);
const month=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',month:'numeric'}).format(new Date()));const available=(month+8)%12+1;if(available<12){const future=structuredClone(account.save);future.progress.basic[available]={missions:[true,false,false],challenge:false};assert.equal((await a('/api/progress',{save:future,revision:account.revision},'PUT')).status,400)}
assert.equal((await guest('/api/account',{action:'login',name,password:'wrong-password'})).status,401);
assert.equal((await teacher('/api/account',{action:'teacher',password:'wrong-password'})).status,401);
assert.equal((await teacher('/api/account',{action:'teacher',password:process.env.TEST_TEACHER_PASSWORD})).status,200);
const room=await teacher('/api/teacher');assert.equal(room.status,200);assert.ok(room.data.students.some(s=>s.name===name));assert.equal(JSON.stringify(room.data).includes('password_hash'),false);
const student=room.data.students.find(s=>s.name===name);const {special}=JSON.parse(await (await import('node:fs/promises')).readFile('app/curriculum.json','utf8'));assert.equal((await teacher('/api/teacher',{action:'award',studentId:student.id,awardId:special[0].id})).status,200);assert.equal((await secondDevice('/api/account')).data.save.special.length,1);
assert.equal((await a('/api/account',{action:'logout'})).status,200);assert.equal((await a('/api/account')).data.user,null);assert.equal((await a('/api/progress',{save:state,revision:0},'PUT')).status,401);
console.log('PASS: registration, duplicate names, login, cross-device restore, user isolation, teacher-only access, CSRF, stale-save conflict, future-month protection, immutable awards/settings, teacher awards, logout.');
console.log('Local test names: '+name+', '+other);
