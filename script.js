// --- Basis instellingen ---
const slagen = ["Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash","Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"];
const playersData = [];

// --- Sliders per speler ---
function createSliders() {
  const slidersSection = document.getElementById("slidersSection");
  slidersSection.innerHTML = "";
  for(let i=1;i<=4;i++){
    let playerName = document.getElementById(`player${i}`).value;
    let div = document.createElement("div");
    div.className="section";
    div.innerHTML=`<h3>Slag-analyse: ${playerName}</h3>`;
    slagen.forEach(s=>{
      div.innerHTML += `<label>${s}: <input type="range" min="0" max="100" value="0" id="${s}_${i}"> <input type="text" id="note_${s}_${i}" placeholder="Notitie"></label>`;
    });
    slidersSection.appendChild(div);
  }
}
createSliders();

// --- Setscore bolletjes 7x5 ---
function createSets() {
  const setsSection = document.getElementById("setsSection");
  setsSection.innerHTML="<h2>Setscores (7 bolletjes per team / max 5 sets)</h2>";
  for(let s=1;s<=5;s++){
    const row = document.createElement("div");
    row.className="set-row";
    row.innerHTML=`<span>Set ${s} Team A: </span>`+Array(7).fill(0).map((_,idx)=>`<div class="bolletje" data-team="A" data-set="${s}" data-idx="${idx}"></div>`).join("")+
      `<span> Team B: </span>`+Array(7).fill(0).map((_,idx)=>`<div class="bolletje" data-team="B" data-set="${s}" data-idx="${idx}"></div>`).join("");
    setsSection.appendChild(row);
  }
}
createSets();

// --- Bolletjes selecteren ---
document.addEventListener("click",e=>{
  if(e.target.classList.contains("bolletje")){
    e.target.classList.toggle("selected");
  }
});

// --- Analyse knoppen ---
document.getElementById("makeAnalysisTop").addEventListener("click",generateFullReport);
document.getElementById("makeAnalysisBottom").addEventListener("click",generateFullReport);

// --- Functie: rapport genereren ---
function generateFullReport(){
  playersData.length=0;
  for(let i=1;i<=4;i++){
    let pdata={name:document.getElementById(`player${i}`).value, sliders:{}, notes:{}};
    slagen.forEach(s=>{
      pdata.sliders[s]=document.getElementById(`${s}_${i}`).valueAsNumber||0;
      pdata.notes[s]=document.getElementById(`note_${s}_${i}`).value||"";
    });
    playersData.push(pdata);
  }

  // 📊 Resultaten - tekst
  let reportText=`🎾 Wedstrijdrapport ${new Date().toLocaleString()}
Link: https://padelstijn.github.io/padel-performance/
Locatie: ${document.getElementById("location").value}
Extra locatie: ${document.getElementById("extraLocation").value}
Reden: ${document.getElementById("matchReason").value}
Extra info: ${document.getElementById("extraInfo").value}
Duur: ${document.getElementById("matchDuration").value} min\n\n`;

  playersData.forEach(p=>{
    reportText+=`Speler ${p.name}:\n📊 Slag-analyse:\n`;
    for(let s of slagen){
      let val=p.sliders[s];
      if(val===0) reportText+=`${s}: 0/100 - Niet gebruikt, oefen deze slag\n`;
      else if(val<20) reportText+=`${s}: ${val}/100 - Bijna niet gebruikt\n`;
      else if(val<50) reportText+=`${s}: ${val}/100 - Verbeterpunt\n`;
      else if(val<70) reportText+=`${s}/100 - Veel gebruikt\n`;
      else reportText+=`${s}: ${val}/100 - Sterk gebruikt\n`;
      if(p.notes[s]) reportText+=`   Notitie: ${p.notes[s]}\n`;
    }
    reportText+="\n";
  });

  // Setscores
  reportText+="🏆 Setscores:\n";
  for(let s=1;s<=5;s++){
    let a= document.querySelectorAll(`.bolletje[data-team="A"][data-set="${s}"].selected`).length;
    let b= document.querySelectorAll(`.bolletje[data-team="B"][data-set="${s}"].selected`).length;
    let winner="Gelijk";
    if(a>b) winner="Team A";
    else if(b>a) winner="Team B";
    reportText+=`Set ${s}: ${a} - ${b} → Winnaar: ${winner}\n`;
  }
  document.getElementById("reportSummaryTop").innerText=reportText;
  document.getElementById("reportSummaryBottom").innerText=reportText;

  renderRadarCharts();
  renderLeaderboard();
}

// --- Radar charts ---
function renderRadarCharts(){
  const radarsDiv=document.getElementById("radars4Players");
  radarsDiv.innerHTML="";
  playersData.forEach(p=>{
    const c=document.createElement("canvas");
    c.className="radar-chart";
    radarsDiv.appendChild(c);
    new Chart(c,{type:'radar',data:{labels:slagen,datasets:[{label:p.name,data:Object.values(p.sliders),backgroundColor:'rgba(13,92,99,0.2)',borderColor:'#0d5c63'}]},options:{responsive:false,scale:{min:0,max:100}}});
  });
}

// --- Leaderboard ---
function renderLeaderboard(){
  const lb=document.getElementById("leaderboard");
  let scores=[];
  playersData.forEach(p=>scores.push({name:p.name,total:Object.values(p.sliders).reduce((a,b)=>a+b,0)/slagen.length}));
  scores.sort((a,b)=>b.total-a.total);
  lb.innerHTML=scores.map((p,i)=>`${i+1}. ${p.name} - ${p.total.toFixed(1)}`).join("<br>");
}

// --- Export TXT ---
document.getElementById("exportTXT").addEventListener("click",()=>{
  const txt=document.getElementById("reportSummaryBottom").innerText + "\nhttps://sites.google.com/view/padeltrainingdatabase";
  const blob=new Blob([txt],{type:"text/plain"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="PadelMatch.txt";
  link.click();
});

// --- Export WhatsApp ---
document.getElementById("exportWhatsApp").addEventListener("click",()=>{
  const txt=document.getElementById("reportSummaryBottom").innerText;
  window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,"_blank");
});

// --- Upload TXT ---
document.getElementById("fileUpload").addEventListener("change",async(e)=>{
  const file=e.target.files[0];
  if(!file) return;
  const text=await file.text();
  document.getElementById("fileContent").innerText=text;
  alert("Historische data geladen! Bekijk verschillen in rapport.");
});

// --- PDF export (gebruik radar charts + tekst) ---
async function exportPDF(){
  if(playersData.length===0){alert("Genereer eerst analyse!"); return;}
  const { jsPDF }=window.jspdf;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  let y=10, pageWidth=doc.internal.pageSize.getWidth();
  doc.setFontSize(14);
  doc.text(`🎾 Wedstrijdrapport ${new Date().toLocaleString()}`,10,y); y+=8;
  doc.setFontSize(10);
  doc.text(`Link: https://padelstijn.github.io/padel-performance/`,10,y); y+=6;
  doc.text(`Locatie: ${document.getElementById("location").value}`,10,y); y+=6;
  doc.text(`Extra locatie: ${document.getElementById("extraLocation").value}`,10,y); y+=6;
  doc.text(`Reden: ${document.getElementById("matchReason").value}`,10,y); y+=6;
  doc.text(`Extra info: ${document.getElementById("extraInfo").value}`,10,y); y+=6;
  doc.text(`Duur: ${document.getElementById("matchDuration").value} min`,10,y); y+=10;

  for(let p of playersData){
    let lines=doc.splitTextToSize(`Speler ${p.name}: Slag-analyse`,pageWidth-20);
    if(y+lines.length*6>285){doc.addPage(); y=10;}
    doc.text(lines,10,y); y+=6*lines.length+2;
    for(let s of slagen){
      let val=p.sliders[s]; let desc="";
      if(val===0) desc="Niet gebruikt, oefen deze slag";
      else if(val<20) desc="Bijna niet gebruikt";
      else if(val<50) desc="Verbeterpunt";
      else if(val<70) desc="Veel gebruikt";
      else desc="Sterk gebruikt";
      let txtLine=`${s}: ${val}/100 - ${desc}`;
      if(p.notes[s]) txtLine+=` - Notitie: ${p.notes[s]}`;
      let l=doc.splitTextToSize(txtLine,pageWidth-20);
      if(y+l.length*6>285){doc.addPage(); y=10;}
      doc.text(l,10,y); y+=6*l.length;
    }
    y+=4;
    // radar chart
    const c=document.createElement("canvas"); c.width=250; c.height=250;
    new Chart(c,{type:'radar',data:{labels:slagen,datasets:[{label:p.name,data:Object.values(p.sliders),backgroundColor:'rgba(13,92,99,0.2)',borderColor:'#0d5c63'}]},options:{responsive:false}});
    await new Promise(r=>setTimeout(r,300));
    const img=c.toDataURL("image/png");
    if(y+70>285){doc.addPage(); y=10;}
    doc.addImage(img,'PNG',50,y,110,70); y+=80;
  }
  doc.text("Meer info: https://sites.google.com/view/padeltrainingdatabase",10,y);
  doc.save("PadelMatch_FullReport.pdf");
}
document.getElementById("exportPDF").addEventListener("click",exportPDF);
