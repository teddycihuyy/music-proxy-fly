const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
app.use(cors());

function ytDlp(args){
return new Promise((res,rej)=>{
exec(args, {timeout: 20000}, (err, stdout, stderr)=>{
if(err) rej(stderr || err.message);
else res(stdout);
});
});
}

app.get('/api', async (req,res)=>{
const {q,id}=req.query;
if(q){
try{
let out = await ytDlp(`yt-dlp "ytsearch8:${q.replace(/"/g,'')}" --flat-playlist --dump-json --no-warnings`);
let lines = out.trim().split("\n").map(l=>JSON.parse(l));
let result = lines.map(j=>({
videoId: j.id,
title: j.title,
author: j.uploader,
videoThumbnails: [{url: j.thumbnail}]
}));
return res.json(result);
}catch(e){ return res.json([]) }
}
if(id){
try{
// bypass po_token pake android + web client
let cmd = `yt-dlp --no-playlist --get-url -f "ba[ext=m4a]/ba" --extractor-args "youtube:player_client=android,web;po_token=web.gvs+android.gvs" "https://www.youtube.com/watch?v=${id}"`;
let url = await ytDlp(cmd);
return res.json({audioUrl: url.trim()});
}catch(e){
// fallback tanpa po_token
try{
let cmd2 = `yt-dlp --no-playlist --get-url -f ba "https://www.youtube.com/watch?v=${id}"`;
let url2 = await ytDlp(cmd2);
return res.json({audioUrl: url2.trim(), fallback:true});
}catch(e2){ return res.json({audioUrl:"", debug: e2.toString().slice(0,300)}) }
}
}
res.json({ok:true});
});

app.listen(3000, ()=>console.log("run 3000"));
