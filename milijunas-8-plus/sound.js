const Sound=(()=>{
 let enabled=true,volume=.45,level=0,bedSource='',reading=false,fxToken=0;
 try{const p=JSON.parse(localStorage.getItem('m8-sound')||'null');if(p){enabled=p.enabled!==false;volume=Number.isFinite(p.volume)?Math.max(0,Math.min(1,p.volume)):.45}}catch{}
 const supported=typeof Audio!=='undefined',probes={};const bg=supported?new Audio():null,fx=supported?new Audio():null;
 if(bg){bg.loop=true;bg.preload='auto';fx.preload='auto'}
 function source(name){const probe=probes[name];return probe&&probe.readyState>=2&&!probe.error?ORIGINAL_SOUNDS[name]:'audio/'+name+'.wav'}
 function store(){try{localStorage.setItem('m8-sound',JSON.stringify({enabled,volume}))}catch{}}
 function volumes(){if(bg)bg.volume=volume*(reading?.12:.32);if(fx)fx.volume=volume}
 function ui(){const b=document.getElementById('soundToggle'),s=document.getElementById('soundVolume');if(b){b.textContent=enabled?'🔊 Zvuk uključen':'🔇 Zvuk isključen';b.setAttribute('aria-pressed',String(enabled))}if(s)s.value=Math.round(volume*100)}
 function play(el){if(!el)return;try{const p=el.play();if(p&&p.catch)p.catch(()=>{const s=document.getElementById('soundStatus');if(s&&enabled)s.textContent='Za pokretanje zvuka dodirni tipku za zvuk.'})}catch{}}
 function assign(el,name){const src=source(name);el.src=src;el.onerror=()=>{if(el.src.includes('zvukipro.com')){el.onerror=null;el.src='audio/'+name+'.wav';if(enabled)play(el)}};const s=document.getElementById('soundStatus');if(s)s.textContent=src.startsWith('http')?'Zvuk iz emisije':'Zamjenski zvuk · izvorna snimka još nije dostupna.';return src}
 function stopFx(){fxToken++;if(fx){fx.pause();fx.currentTime=0;fx.muted=false}}
 function unlock(){if(!enabled||!fx)return;const token=++fxToken;assign(fx,'correct');fx.muted=true;try{const p=fx.play();if(p&&p.then)p.then(()=>{if(token===fxToken){fx.pause();fx.currentTime=0;fx.muted=false}}).catch(()=>{if(token===fxToken)fx.muted=false})}catch{fx.muted=false}}
 function question(n){level=n;reading=false;stopFx();if(!bg)return;const name=n<5?'bed-easy':n<10?'bed-medium':'bed-hard',src=source(name);if(src!==bedSource){bedSource=assign(bg,name)}volumes();if(enabled&&!document.hidden)play(bg)}
 function effect(name){if(!enabled||!fx||document.hidden)return;stopFx();assign(fx,name);volumes();play(fx)}
 function stopBed(){if(bg)bg.pause()}
 function stop(){stopBed();stopFx();reading=false}
 function duck(v){reading=v;volumes()}
 function toggle(){enabled=!enabled;store();ui();if(!enabled)stop();else{unlock();if(typeof active!=='undefined'&&active)question(level)}}
 function init(){if(supported){bg.id='gameBackground';fx.id='gameEffect';bg.hidden=fx.hidden=true;document.body.append(bg,fx);for(const [name,url] of Object.entries(ORIGINAL_SOUNDS)){const p=new Audio();p.preload='auto';p.src=url;probes[name]=p;p.load()}}const b=document.getElementById('soundToggle'),s=document.getElementById('soundVolume');if(!b||!s)return;b.onclick=toggle;s.oninput=()=>{volume=Number(s.value)/100;volumes();store()};ui();volumes();if(!supported){b.disabled=true;document.getElementById('soundStatus').textContent='Zvuk nije podržan u ovom pregledniku.'}document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(enabled&&typeof active!=='undefined'&&active&&!locked)question(level)})}
 return{init,unlock,question,effect,stopBed,stop,duck};
})();
