// Slagenlijst
const slagen = ["Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash","Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"];
const numPlayers = 4;
const numSets = 5;
const bolletjesPerTeam = 7;

window.onload = () => {
  // Maak sliders per speler
  for(let p=1;p<=numPlayers;p++){
    const container = document.getElementById(`sliders${p}`);
    slagen.forEach(slag=>{
      const div = document.createElement('div');
      div.className='slider-group';
      div.innerHTML = `<label>${slag}: <span id="value${p}_${slag}">50</span></label>
      <input type="range" min="0" max="100" value="50" id="slider${p}_${slag}"> 
      <input type="number" min="0" max="100" value="50" id="num${p}_${slag}">`;
      container.appendChild(div);
      const slider = document.getElementById(`slider${p}_${slag}`);
      const num = document.getElementById(`num${p}_${slag}`);
      const value = document.getElementById(`value${p}_${slag}`);
      slider.oninput = ()=>{ value.textContent=slider.value; num.value=slider.value;}
      num.oninput = ()=>{ value.textContent=num.value; slider.value=num.value;}
    });
  }

  // Maak sets bolletjes
  const setsDiv = document.getElementById('sets');
  for(let s=1;s<=numSets;s++){
    const row = document.createElement('div');
    row.className='set-row';
    row.innerHTML = `<strong>Set ${s}:</strong> Team A: <span id="teamA${s}"></span> Team B: <span id="teamB${s}"></span>`;
    setsDiv.appendChild(row);
    // Bolletjes team A
    for(let i=1;i<=bolletjesPerTeam;i++){
      const b = document.createElement('div');
      b.className='bolletje'; b.textContent=i;
      b.onclick=()=>{ selectBolletjes(`teamA${s}`,i);}
      document.getElementById(`teamA${s}`).appendChild(b);
    }
    // Bolletjes team B
    for(let i=1;i<=bolletjesPerTeam;i++){
      const b = document.createElement('div');
      b.className='bolletje'; b.textContent=i;
      b.onclick=()=>{ selectBolletjes(`teamB${s}`,i);}
      document.getElementById(`teamB${s}`).appendChild(b);
    }
  }

  // Analyse buttons
  document.getElementById('makeAnalysisTop').onclick = makeAnalysis;
  document.getElementById('makeAnalysisBottom').onclick = makeAnalysis;

  // Export buttons
  document.getElementById('exportTXT').onclick = ()=>exportTXT();
  document.getElementById('exportPDF').onclick = ()=>exportPDF();
  document.getElementById('exportWhatsApp').onclick = ()=>exportWhatsApp();

  // File upload
  document.getElementById('fileUpload').onchange = handleFile;
}

// Kies bolletjes
function selectBolletjes(id,num){
  const container = document.getElementById(id);
  Array.from(container.children).forEach(c=>c.classList.remove('selected'));
  for(let i=0;i<num;i++){ container.children[i].classList.add('selected');}
}

// Simpele AI analyse
function aiAnalyse(){
  let result = {};
  for(let p=1;p<=numPlayers;p++){
    let scores = [];
    slagen.forEach(slag=>{
      scores.push({slag:slag, value:parseInt(document.getElementById(`slider${p}_${slag}`).value)});
    });
    scores.sort((a,b)=>b.value-a.value);
    const sterkste = scores[0].slag;
    const verbeterpunten = scores.filter(s=>s.value<50).map(s=>s.slag);
    result[`player${p}`] = {scores, sterkste, verbeterpunten};
  }
  return result;
}

// Maak analyse
function makeAnalysis(){
  const date = new Date();
  let txt = `🎾 Wedstrijdrapport ${date.toLocaleDateString()}, ${date.toLocaleTimeString()}\n`;
  txt += `Locatie: ${document.getElementById('location').value}\n`;
  const extraLoc = document.getElementById('extraLocation').value;
  if(extraLoc) txt += `Extra locatie: ${extraLoc}\n`;
  txt += `Reden wedstrijd: ${document.getElementById('matchReason').value}\n`;
  const extraInfo = document.getElementById('extraInfo').value;
  if(extraInfo) txt += `Extra info: ${extraInfo}\n`;
  txt += `Duur: ${document.getElementById('matchDuration').value} min\n\n`;

  const ai = aiAnalyse();
  for(let p=1;p<=numPlayers;p++){
    txt += `Speler ${document.getElementById(`player${p}`).value}:\n`;
    txt += `Observaties: ${document.getElementById(`notes${p}`).value}\n`;
    txt += `📊 Slag-analyse:\n`;
    ai[`player${p}`].scores.forEach(s=>{ txt+=`${s.slag}: ${s.value}/100\n`});
    txt += `Sterkste slag: ${ai[`player${p}`].sterkste}\n`;
    if(ai[`player${p}`].verbeterpunten.length>0) txt += `Verbeterpunten: ${ai[`player${p}`].verbeterpunten.join(', ')}\n`;
    txt += '\n';
  }

  // Sets
  txt += `🏆 Setscores:\n`;
  for(let s=1;s<=numSets;s++){
    const tA = document.getElementById(`teamA${s}`).querySelectorAll('.selected').length;
    const tB = document.getElementById(`teamB${s}`).querySelectorAll('.selected').length;
    let winner = 'Gelijk';
    if(tA>tB) winner='Team A';
    else if(tB>tA) winner='Team B';
    if(tA+tB>0) txt+=`Set ${s}: ${tA} - ${tB} → Winnaar: ${winner}\n`;
  }

  document.getElementById('reportOutput').textContent=txt;
}

// Export functies
function exportTXT(){ 
  const text = document.getElementById('reportOutput').textContent;
  const blob = new Blob([text], {type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='padel-report.txt'; a.click();
}
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = document.getElementById('reportOutput').textContent;
  const lines = doc.splitTextToSize(text,180);
  doc.text(lines,10,10);
  doc.save('padel-report.pdf');
}
function exportWhatsApp(){
  const text = document.getElementById('reportOutput').textContent;
  const url = 'https://web.whatsapp.com/send?text='+encodeURIComponent(text);
  window.open(url,'_blank');
}

// File upload lezen
function handleFile(e){
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(evt){
    document.getElementById('fileContent').textContent = evt.target.result;
  }
  reader.readAsText(file);
}
