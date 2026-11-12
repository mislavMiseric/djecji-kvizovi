const Sound=(()=>{
 let ctx=null,master=null,bed=null,fx=null,loop=null,phase='',step=0,enabled=true,volume=.4,reading=false,nodes=new Set();
 try{const p=JSON.parse(localStorage.getItem('potjera-sound-v1')||'null');if(p){enabled=p.enabled!==false;if(Number.isFinite(p.volume))volume=Math.max(0,Math.min(1,p.volume))}}catch{}
 function store(){try{localStorage.setItem('potjera-sound-v1',JSON.stringify({enabled,volume}))}catch{}}
 function volumes(){if(master)master.gain.value=enabled?volume:0;if(bed)bed.gain.value=reading?.08:.2}
 function ensure(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;try{if(!ctx){ctx=new AC();master=ctx.createGain();bed=ctx.createGain();fx=ctx.createGain();master.connect(ctx.destination);bed.connect(master);fx.connect(master);volumes()}if(ctx.state==='suspended'){const p=ctx.resume();if(p&&p.catch)p.catch(()=>{})}return true}catch{return false}}
 function tone(f,t,d=.2,amp=.3,channel=fx,type='sine'){if(!ctx||!enabled||document.hidden)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;o.connect(g);g.connect(channel);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+.014);g.gain.exponentialRampToValueAtTime(.001,t+d);o.start(t);o.stop(t+d+.02);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();g.disconnect()}}
 function effect(name){if(!enabled||document.hidden||!ensure())return;const sequences={correct:[523.25,659.25,783.99],wrong:[220,185,146.83],move:[130.81,164.81],miss:[293.66,246.94],bonus:[392,523.25,659.25],win:[261.63,329.63,392,523.25,659.25,783.99],caught:[196,155.56,130.81,98]};const seq=sequences[name]||sequences.correct,d=name==='win'?.22:.14;seq.forEach((f,i)=>tone(f,ctx.currentTime+i*d,d+.12,.23))}
 function tick(){if(!ctx||!enabled||document.hidden)return;const base=phase==='hunt'?146.83:phase==='board'?130.81:110,pattern=[1,1.5,2,1.5,1,1.2,1.5,1.2];tone(base*pattern[step++%8],ctx.currentTime,.38,.25,bed);if(step%2===0)tone(base/2,ctx.currentTime,.48,.14,bed)}
 function pause(){clearInterval(loop);loop=null;for(const n of nodes){try{n.stop()}catch{}}nodes.clear()}
 function background(p){if(phase===p&&loop)return;phase=p;if(!enabled||document.hidden||!ensure())return;pause();step=0;tick();loop=setInterval(tick,p==='hunt'?380:520)}
 function stop(){pause();phase='';reading=false;volumes()}
 function duck(v){reading=v;volumes()}
 function ui(){const b=document.getElementById('soundToggle'),s=document.getElementById('soundVolume');if(b){b.textContent=enabled?'🔊 Zvuk uključen':'🔇 Zvuk isključen';b.setAttribute('aria-pressed',String(enabled))}if(s)s.value=Math.round(volume*100)}
 function init(){const b=document.getElementById('soundToggle'),s=document.getElementById('soundVolume');if(!b||!s)return;b.onclick=()=>{enabled=!enabled;store();ui();volumes();if(!enabled)pause();else if(phase)background(phase)};s.oninput=()=>{volume=Number(s.value)/100;volumes();store()};ui();document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(phase&&enabled)background(phase)});if(!window.AudioContext&&!window.webkitAudioContext){b.disabled=true;b.textContent='Zvuk nije podržan'}}
 return{init,background,effect,stop,duck};
})();
