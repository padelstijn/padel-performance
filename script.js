const playerNames = ["Speler A","Speler B","Speler C","Speler D"];
const slagen = ["Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash","Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"];

const slagUitleg = {
  "Forehand":"De Forehand wordt vaak gezien als de makkelijkste slag...",
  "Backhand":"Bij de Backhand kan je platte en slice technieken gebruiken...",
  "Volley":"Wat eigenlijk het belangrijkste is bij Padel is dat je goed kan volleren...",
  "Bandeja":"De Bandeja is een defensieve slice smash...",
  "Platte Smash":"De Platte Smash is bedoeld om direct te scoren...",
  "Topspin Smash":"Topspin Smash geeft de bal een voorwaartse rotatie...",
  "Kicksmash":"De Kicksmash is een variatie die moeilijk terug te spelen is...",
  "Vibora":"De Vibora is een slice die diagonaal richting tegenstander gaat...",
  "Gancho":"Gancho is een aanvalsschot aan het net...",
  "Bajada":"De Bajada is een aanvallende bal vanuit achterveld...",
  "Lob":"De Lob is een verdedigende of strategische bal naar achter...",
  "Dropshot":"De Dropshot is een zachte bal die dicht bij het net landt...",
  "Service":"Een goede service legt de druk bij de tegenstander...",
  "Return":"Return is belangrijk om het initiatief te heroveren..."
};

const playersDiv = document.getElementById("players");
let playersData = [];

playerNames.forEach((name)=>{
  const div = document.createElement("div");
  div.className="player-section";
  div.innerHTML = `<h3>${name}</h3>`;
  slagen.forEach(sl=>{
    const group = document.createElement("div");
    group.className="slider-group";
    group.innerHTML = `
      <label>${sl} notitie: <input type="text" class="note-${sl}" placeholder="Notitie"></label>
      <input type="range" min="0" max="100" value="0" class="slider-${sl}">
    `;
    div.appendChild(group);
  });
  playersDiv.appendChild(div);
  playersData.push({name, sliders:{}, notes:{}});
});

// Setscores
const setsDiv = document.getElementById("sets");
for(let s=1;s<=5;s++){
  const row = document.createElement("div");
  row.className="set-row";
  row.innerHTML=`<strong>Set ${s}</strong> `;
  ["A","B"].forEach(team=>{
    const teamDiv = document.createElement("div");
    teamDiv.className="bolletjes-row";
    for(let b=1;b<=7;b++){
      const bol = document.createElement("div");
      bol.className="bolletje"; bol.dataset.selected="false"; bol.innerText=b;
      bol.addEventListener("click",()=>{ bol.dataset.selected = bol.dataset.selected==="false"?"true":"false"; bol.classList.toggle("selected"); });
      teamDiv.appendChild(bol);
    }
    row.appendChild(teamDiv);
  });
  setsDiv.appendChild(row);
}

// Gather sliders + notes
function gatherData(){
  playersData.forEach(p=>{
    slagen.forEach(sl=>{
      const slider = document.querySelector(`.slider-${sl}`);
      const note = document.querySelector(`.note-${sl}`);
      p.sliders[sl] = slider.valueAsNumber||0;
      p.notes[sl] = note.value||"";
    });
  });
}

// Generate textual analysis per player
function generatePlayerText(p){
  let txt=`📊 Slag-analyse ${p.name}:\n`;
  slagen.forEach(sl=>{
    const score = p.sliders[sl];
    txt+=`${sl}: ${score}/100 `;
    if(score===0) txt+=`→ Deze slag is niet gebruikt en mag je vaker oefenen. ${slagUitleg[sl]}\n`;
    else if(score<20) txt+=`→ Bijna niet gespeeld, aandacht nodig. ${slagUitleg[sl]}\n`;
    else if(score<50) txt+=`→ Verbeterpunt. ${slagUitleg[sl]}\n`;
    else if(score<70) txt+=`→ Goed gebruikt.\n`;
    else txt+=`→ Sterk punt!\n`;
    if(p.notes[sl]) txt+=`Notitie: ${p.notes[sl]}\n`;
  });
  return txt;
}

function generateAnalysis(){
  gatherData();
  const topDiv = document.getElementById("textAnalysisTop");
  const resultsDiv = document.getElementById("analysisResults");
  const radarsDiv = document.getElementById("radarsContainer");
  topDiv.innerHTML = `<pre>🎾 Wedstrijdrapport ${new Date().toLocaleString()}
Link: https://padelstijn.github.io/padel-performance/
Locatie: ${document.getElementById("location").value}
Extra locatie: ${document.getElementById("extraLocation").value}
Reden: ${document.getElementById("matchReason").value}
Extra info: ${document.getElementById("extraInfo").value}
Duur: ${document.getElementById("matchDuration").value} min</pre>`;

  resultsDiv.innerHTML="";
  radarsDiv.innerHTML="";
  playersData.forEach(p=>{
    const div = document.createElement("div");
    div.innerHTML = `<pre>${generatePlayerText(p)}</pre>`;
    resultsDiv.appendChild(div);
    const canvas = document.createElement("canvas");
    resultsDiv.appendChild(canvas);
    new Chart(canvas,{
      type:'radar',
      data:{labels:slagen,datasets:[{label:p.name,data:Object.values(p.sliders),backgroundColor:'rgba(13,92,99,0.2)',borderColor:'#0d5c63'}]},
      options:{responsive:true,scale:{min:0,max:100}}
    });
    // Also global radar
    const canvas2 = document.createElement("canvas");
    radarsDiv.appendChild(canvas2);
    new Chart(canvas2,{
      type:'radar',
      data:{labels:slagen,datasets:[{label:p.name,data:Object.values(p.sliders),backgroundColor:'rgba(13,92,99,0.2)',borderColor:'#0d5c63'}]},
      options:{responsive:true,scale:{min:0,max:100}}
    });
  });
}

document.getElementById("makeAnalysisTop").addEventListener("click",generateAnalysis);
document.getElementById("makeAnalysisBottom").addEventListener("click",generateAnalysis);

// Exporters kunnen TXT, PDF, WhatsApp bevatten (zelfde als eerder, met tekst + notities + uitleg)
