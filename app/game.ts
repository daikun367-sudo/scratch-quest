import curriculum from './curriculum.json';
export const courses=curriculum.courses;
export const specialAwards=curriculum.special;
export type CourseId='basic'|'advance';
export type ChapterProgress={missions:boolean[];challenge:boolean};
export type Save={version:2;startYear:number;name:string;course:CourseId;progress:Record<CourseId,Record<string,ChapterProgress>>;special:{id:string;date:string}[];opts:{unlockAll:boolean;hideAnswer:boolean;scratchUrl:string};last:{course:CourseId;chapter:number;mission:number}};
export const SAVE_KEY='scratch-quest-rpg-v2';
export function japanCalendar(date=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'numeric'}).formatToParts(date);return {year:Number(parts.find(p=>p.type==='year')!.value),month:Number(parts.find(p=>p.type==='month')!.value)}}
export function fiscalYear(date=new Date()){const {year,month}=japanCalendar(date);return month<4?year-1:year}
export function availableChapters(save:Save,date=new Date()){const {year,month}=japanCalendar(date);return Math.max(0,Math.min(12,(year-save.startYear)*12+month-3))}
export function freshSave():Save{return {version:2,startYear:fiscalYear(),name:'',course:'basic',progress:{basic:{},advance:{}},special:[],opts:{unlockAll:false,hideAnswer:false,scratchUrl:''},last:{course:'basic',chapter:0,mission:0}}}
export function progress(save:Save,cid:CourseId,ci:number):ChapterProgress{return save.progress[cid][ci]??{missions:Array(courses[cid==='basic'?0:1].chapters[ci].missions.length).fill(false),challenge:false}}
export function cleared(save:Save,cid:CourseId,ci:number){return progress(save,cid,ci).missions.every(Boolean)}
export function unlocked(save:Save,cid:CourseId,ci:number,date=new Date()){return save.opts.unlockAll||ci<availableChapters(save,date)||cleared(save,cid,ci)}
export function firstChapter(save:Save,cid:CourseId){const i=courses[cid==='basic'?0:1].chapters.findIndex((_,i)=>!cleared(save,cid,i));return i<0?11:i}
export function totalMissions(save:Save){return courses.reduce((n,c)=>n+c.chapters.reduce((m,_,i)=>m+progress(save,c.id as CourseId,i).missions.filter(Boolean).length,0),0)}
export function markMission(save:Save,cid:CourseId,ci:number,mi:number,done=true):Save{if(!Number.isInteger(ci)||ci<0||ci>11||!Number.isInteger(mi)||mi<0||mi>2||!unlocked(save,cid,ci))throw Error('このクエストはまだ開けません');const p=progress(save,cid,ci);return {...save,progress:{...save.progress,[cid]:{...save.progress[cid],[ci]:{...p,missions:p.missions.map((x,i)=>i===mi?done:x)}}},last:{course:cid,chapter:ci,mission:Math.min(2,mi+1)}}}
export function safeUrl(raw:string){if(!raw.trim())return 'https://scratch.mit.edu/projects/editor/';try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
export function parseSave(raw:unknown):Save{if(!raw||typeof raw!=='object')throw Error('記録の形式が違います');const v=raw as Record<string,unknown>;if(!v.progress||typeof v.progress!=='object'||!['basic','advance'].includes(String(v.course)))throw Error('SCRATCH QUESTの記録を選んでください');const s=freshSave();if(Number.isInteger(v.startYear)&&Number(v.startYear)>=2020&&Number(v.startYear)<=fiscalYear())s.startYear=Number(v.startYear);s.course=v.course as CourseId;s.name=typeof v.name==='string'?v.name.slice(0,20):'';const p=v.progress as Record<string,unknown>;for(const cid of ['basic','advance'] as const){if(!p[cid]||typeof p[cid]!=='object')throw Error('コースの記録が見つかりません');for(const [key,value] of Object.entries(p[cid]!)){const i=Number(key);if(!Number.isInteger(i)||i<0||i>11)continue;if(!value||typeof value!=='object')throw Error('ミッションの記録が読みこめません');const ch=value as Record<string,unknown>;if(!Array.isArray(ch.missions)||ch.missions.some(x=>typeof x!=='boolean'))throw Error('ミッションの記録が読みこめません');s.progress[cid][i]={missions:Array.from({length:3},(_,j)=>(ch.missions as boolean[])[j]===true),challenge:ch.challenge===true}}}
if(v.opts&&typeof v.opts==='object'){const o=v.opts as Record<string,unknown>;s.opts={unlockAll:o.unlockAll===true,hideAnswer:o.hideAnswer===true,scratchUrl:typeof o.scratchUrl==='string'&&safeUrl(o.scratchUrl)?o.scratchUrl:''}}
if(Array.isArray(v.special))s.special=v.special.filter(x=>x&&typeof x.id==='string'&&specialAwards.some(a=>a.id===x.id)&&typeof x.date==='string').map(x=>({id:x.id,date:x.date}));if(v.last&&typeof v.last==='object'){const l=v.last as Record<string,unknown>;if(['basic','advance'].includes(String(l.course))&&Number.isInteger(l.chapter)&&Number(l.chapter)>=0&&Number(l.chapter)<12&&Number.isInteger(l.mission)&&Number(l.mission)>=0&&Number(l.mission)<3)s.last=l as Save['last']}
return s}
export const places=[[20,33],[79,28],[90,72],[77,53],[22,71],[40,49],[48,25],[60,43],[88,43],[53,75],[30,21],[64,85]];
export const basicOutcomes=[
['勇者が最初の一歩をふみ出した！ 村の門まで、もうすぐだ。','魔物が動きだした！ 追いかけて、王国を守る最後の仕組みを作ろう。','王国に平和が戻った！ 村人たちが、きみと勇者を迎えている。'],
['アルゴが新しい手を出した！ 「つぎは、きみの手も教えて！」','アルゴにきみの声が届いた！ あとは勝ち負けを決める力だ。','アルゴの修理が完了！ 「ありがとう。ぼくと、もう一勝負しよう！」'],
['海に魚たちが戻ってきた。宝物を探す旅に出よう！','宝物を発見！ 集めた数を記録できるようにしよう。','宝箱がいっぱいになった！ 海底探検、大成功。'],
['ショップのさいふができた！ お客さんを迎える準備をしよう。','はじめてのお買い物！ おかねが足りないときの工夫も必要だ。','モンスターショップ開店！ みんなが安心して買い物できるね。'],
['隕石が接近中！ 宇宙船を動かして、切りぬけよう。','操縦システム復旧！ どれだけ長く飛べるか記録しよう。','宇宙船が無事に帰還！ きみのプログラムが仲間を守った。'],
['証人から手がかりを聞き出した！ つぎの質問を考えよう。','選択によって新しい証言が！ 真相まで、あと一歩。','事件解決！ きみの推理が、町に笑顔を取り戻した。'],
['おばけたちが姿を現した！ どんな動きをするのかな？','屋敷のあちこちにおばけが！ 捕まえる仕組みを作ろう。','屋敷が静かになった！ おばけ退治の達人だね。'],
['エンジン始動！ きみのマシンが走り出した。','コースの仕組みが完成！ 自分の記録に挑戦しよう。','ゴール！ きみのマシンが、レースを走りきった。'],
['工場のベルトが動き出した！ おもちゃがやってくる。','仕分けシステム復旧！ できた数を数えてみよう。','おもちゃが出荷された！ 子どもたちの笑顔が待っている。'],
['はじめての魔法を選んだ！ その力を試してみよう。','魔法が発動！ 力を使いすぎない工夫も必要だ。','魔法使いの試験に合格！ きみの工夫が、新しい力になった。'],
['魔物の群れが接近！ 城を守る仕組みを作ろう。','城の守りが整った！ 最後の波を迎え撃とう。','王国を守りきった！ 学んだ力が、ひとつにつながった。'],
['きみだけの企画が誕生！ まずは遊べる形にしてみよう。','オリジナルゲームが動いた！ だれかに遊んでもらおう。','フェスティバル開幕！ きみはもう、ゲームクリエイターだ。']
];
export const advanceEndings=['不具合を解決。開発チームの一員として、次のプロジェクトへ！','状態を持つロボットが完成。設計したルールが、動きになった。','宇宙船の制御が復旧。複数の条件を整理した成果だ。','きみの音楽アプリから、最初のメロディが流れた。','対戦ゲームが完成。たくさんのクローンが連携して動いている。','データが伝わるグラフに変わった。分析結果をチームに伝えよう。','新しいダンジョンが出現。遊べることを確かめるのも、設計の一部だ。','ボス戦が完成。攻略できる面白さを、きみが作った。','スコアの記録と共有を設計できた。データの扱いに一歩近づいた。','整理されたプログラムで、次の改良がしやすくなった。','仕様に沿った作品が完成。依頼を形にする力がついたね。','自社タイトル発表！ 集まった反応を、次の作品に活かそう。'];
export function outcome(cid:CourseId,ci:number,mi:number){return cid==='basic'?basicOutcomes[ci][mi]:mi===2?advanceEndings[ci]:mi===0?'最初の課題を突破。設計の見通しが立ったね。次の検証に進もう。':'仕組みがつながってきた。最後の確認と改良で、作品を仕上げよう。'}
