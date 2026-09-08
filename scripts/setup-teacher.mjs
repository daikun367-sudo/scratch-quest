import {createInterface} from 'node:readline';
import {Writable} from 'node:stream';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {writeFile,access} from 'node:fs/promises';
let exists=false;try{await access('.dev.vars');exists=true}catch{}
if(exists){console.error('.dev.vars は既にあります。上書きせず終了します。');process.exit(1)}
let muted=false;
const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk,encoding);callback()}});
const rl=createInterface({input:process.stdin,output,terminal:true});
rl.question('先生用パスワードを入力（入力文字は表示されません）: ',async password=>{muted=false;rl.close();process.stdout.write('\n');if(password.length<8){console.error('8文字以上で設定してください。');process.exitCode=1;return}const salt=randomBytes(16).toString('hex');const hash=salt+':'+pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');await writeFile('.dev.vars',`TEACHER_PASSWORD_HASH="${hash}"\n`,{mode:0o600,flag:'wx'});console.log('ローカル先生用ログインを設定しました。.dev.varsはGitHubにアップロードしないでください。');});muted=true;
