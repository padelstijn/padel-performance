// ==========================
// Setup players and slagen
// ==========================
const playerNames = ["Speler A","Speler B","Speler C","Speler D"];
const slagen = ["Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash","Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"];

const playersDiv = document.getElementById("players");

let playersData = [];

playerNames.forEach((name,i)=>{
  const div = document.createElement("div");
  div.className="player-section";
  div.innerHTML = `<h3>${name}</h3>`;
  const slidersContainer = document.createElement("div");
  slidersContainer.className="sliders-container";

  slagen.forEach(slug=>{
    const group = document.createElement("div");
    group.className="slider-group";
    group.innerHTML=`
      <label>${slug} <input type="number" class="note-${slug}" placeholder="Notitie"></label>
      <input type="range" min="0" max="100" value="0" class="slider-${slug}">
    `;
    slidersContainer.appendChild(group);
  });
  div.appendChild(slidersContainer);
  playersDiv.appendChild(div);
  playersData.push({name, sliders:{}, notes:{}});
});

// ==========================
// Setscores 5 sets × 7 bolletjes
// ==========================
const setsDiv = document.getElementById("sets");
const maxSets = 5;
for(let s=1;s<=maxSets;s++){
  const row = document.createElement("div");
  row.className="set-row";
  row.innerHTML=`<strong>Set ${s}</strong> `;
  ["A","B"].forEach(team=>{
    const teamDiv = document.createElement("div");
    teamDiv.className="bolletjes-row";
    for(let b=1;b<=7;b++){
      const bol = document.createElement("div");
      bol.className="bolletje";
      bol.dataset.selected="false";
      bol.innerText=b;
      bol.addEventListener("click",()=>{ 
        bol.dataset.selected=bol.dataset.selected==="false"?"true":"false";
        bol.classList.toggle("selected");
      });
      teamDiv.appendChild(bol);
    }
    row.appendChild(teamDiv);
  });
  setsDiv.appendChild(row);
}

// ==========================
// Analyse knop
// ==========================
function gatherData(){
  playersData.forEach((p,i)=>{
    slagen.forEach(s=>{
      const slider = document.querySelector(`.slider-${s}`,(i*1000));
      const note = document.querySelector(`.note-${s}`);
      p.sliders[s]=slider.valueAsNumber||0;
      p.notes[s]=note.value||"";
    });
  });
}

function generateAnalysis(){
  gatherData();
  const analysisResults = document.getElementById("analysisResults");
  analysisResults.innerHTML="";
  const radarsContainer = document.getElementById("radarsContainer");
  radarsContainer.innerHTML="";

  playersData.forEach((p,i)=>{
    const div = document.createElement("div");
    div.innerHTML=`<h3>${p.name}</h3>`;
    let text="<ul>";
    let maxVal = Math.max(...Object.values(p.sliders));
    let minVal = Math.min(...Object.values(p.sliders));
    text+=`<li>Sterkste slag: ${Object.keys(p.sliders).find(k=>p.sliders[k]===maxVal)} (${maxVal})</li>`;
    text+=`<li>Verbeterpunten (onder 50): ${Object.keys(p.sliders).filter(k=>p.sliders[k]<50).join(", ")}</li>`;
    text+=`<li>Slagen bijna niet gespeeld (onder 20): ${Object.keys(p.sliders).filter(k=>p.sliders[k]<20).join(", ")}</li>`;
    text+="</ul>";
    // Notes
    text+="<ul>";
    Object.keys(p.notes).forEach(k=>{
      if(p.notes[k]!=="") text+=`<li>${k} notitie: ${p.notes[k]}</li>`;
    });
    text+="</ul>";
    div.innerHTML+=text;
    const canvas = document.createElement("canvas");
    div.appendChild(canvas);
    analysisResults.appendChild(div);

    // Radar chart
    new Chart(canvas,{
      type:'radar',
      data:{
        labels:slagen,
        datasets:[{
          label:p.name,
          data:Object.values(p.sliders),
          backgroundColor:'rgba(13,92,99,0.2)',
          borderColor:'#0d5c63'
        }]
      },
      options:{
        responsive:true,
        scale:{min:0,max:100}
      }
    });
    // Also add to global radars
    const canvas2 = document.createElement("canvas");
    radarsContainer.appendChild(canvas2);
    new Chart(canvas2,{
      type:'radar',
      data:{
        labels:slagen,
        datasets:[{
          label:p.name,
          data:Object.values(p.sliders),
          backgroundColor:'rgba(13,92,99,0.2)',
          borderColor:'#0d5c63'
        }]
      },
      options:{
        responsive:true,
        scale:{min:0,max:100}
      }
    });
  });
}

// ==========================
// Buttons
// ==========================
document.getElementById("makeAnalysisTop").addEventListener("click",generateAnalysis);
document.getElementById("makeAnalysisBottom").addEventListener("click",generateAnalysis);

document.getElementById("exportTXT").addEventListener("click",()=>{
  gatherData();
  let text=`Wedstrijdrapport ${new Date().toLocaleString()}\n`;
  text+="https://padelstijn.github.io/padel-performance/\n\n";
  playersData.forEach(p=>{
    text+=`Speler ${p.name}:\n`;
    slagen.forEach(s=>{
      text+=`${s}: ${p.sliders[s]}/100`;
      if(p.notes[s]!=="") text+=` (Notitie: ${p.notes[s]})`;
      text+="\n";
    });
    text+="\n";
  });
  text+="https://sites.google.com/view/padeltrainingdatabase";
  const blob = new Blob([text],{type:"text/plain"});
  const link = document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="PadelMatch.txt";
  link.click();
});

document.getElementById("exportPDF").addEventListener("click",()=>{
  gatherData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'mm',format:'a4'});
  let y=10;
  doc.setFontSize(12);
  doc.text(`Wedstrijdrapport ${new Date().toLocaleString()}`,10,y); y+=10;
  doc.text("https://padelstijn.github.io/padel-performance/",10,y); y+=10;
  playersData.forEach(p=>{
    doc.text(`Speler ${p.name}:`,10,y); y+=6;
    slagen.forEach(s=>{
      doc.text(`${s}: ${p.sliders[s]}/100 ${p.notes[s]?('(Notitie: '+p.notes[s]+')'):""}`,10,y); y+=6;
    });
    y+=5;
  });
  doc.text("https://sites.google.com/view/padeltrainingdatabase",10,y);
  doc.save("PadelMatch.pdf");
});

document.getElementById("exportWhatsApp").addEventListener("click",()=>{
  gatherData();
  let text=`Wedstrijdrapport ${new Date().toLocaleString()}\n`;
  playersData.forEach(p=>{
    text+=`Speler ${p.name}:\n`;
    slagen.forEach(s=>{text+=`${s}: ${p.sliders[s]}/100\n`;});
    text+="\n";
  });
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");
});

// ==========================
// Upload TXT
// ==========================
document.getElementById("fileUpload").addEventListener("change", e=>{
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(ev){
      document.getElementById("fileContent").textContent = ev.target.result;
      alert("TXT geladen en toegevoegd aan rapport.");
    };
    reader.readAsText(file);
  }
});
