// Spelers & Slagen
const players = ['player1','player2','player3','player4'];
const slagen = ['Forehand','Backhand','Volley','Bandeja','Platte Smash','Topspin Smash','Kicksmash','Vibora','Gancho','Bajada','Lob','Dropshot','Service','Return'];

// Maak sliders + inputvelden per speler
function initSliders(){
  const slidersDiv = document.getElementById('sliders');
  slidersDiv.innerHTML='';
  players.forEach(p=>{
    const pname = document.getElementById(p).value;
    const spDiv = document.createElement('div');
    spDiv.className='slider-group';
    spDiv.innerHTML = `<h3>${pname}</h3>`;
    slagen.forEach(s=>{
      const sid = `${p}_${s.replace(/\s/g,'')}`;
      spDiv.innerHTML += `
      <label>${s}: <input type="range" id="${sid}" min="0" max="100" value="50">
      <input type="number" id="${sid}_num" min="0" max="100" value="50"></label>
      `;
    });
    slidersDiv.appendChild(spDiv);
  });

  // Koppel sliders met number inputs
  slagen.forEach(s=>{
    players.forEach(p=>{
      const sid = `${p}_${s.replace(/\s/g,'')}`;
      const range = document.getElementById(sid);
      const num = document.getElementById(`${sid}_num`);
      range.oninput = ()=>{num.value=range.value;};
      num.oninput = ()=>{range.value=num.value;};
    });
  });
}

// Setscores init
const numSets = 5;
const bolletjesPerTeam = 7;

function initSets() {
  const setsDiv = document.getElementById('sets');
  setsDiv.innerHTML='';
  for(let s=1;s<=numSets;s++){
    const row = document.createElement('div');
    row.className='set-row';
    row.innerHTML = `<strong>Set ${s}:</strong> Team A: <span id="teamA${s}"></span> Team B: <span id="teamB${s}"></span>`;
    setsDiv.appendChild(row);

    // Bolletjes Team A
    const tAContainer = document.getElementById(`teamA${s}`);
    for(let i=1;i<=bolletjesPerTeam;i++){
      const bA = document.createElement('div');
      bA.className='bolletje';
      bA.textContent=i;
      bA.onclick=()=>selectBolletjes(`teamA${s}`,i);
      tAContainer.appendChild(bA);
    }
    // Bolletjes Team B
    const tBContainer = document.getElementById(`teamB${s}`);
    for(let i=1;i<=bolletjesPerTeam;i++){
      const bB = document.createElement('div');
      bB.className='bolletje';
      bB.textContent=i;
      bB.onclick=()=>selectBolletjes(`teamB${s}`,i);
      tBContainer.appendChild(bB);
    }
  }
}

// selectie bolletjes
function selectBolletjes(id,num){
  const container=document.getElementById(id);
  Array.from(container.children).forEach(c=>c.classList.remove('selected'));
  for(let i=0;i<num;i++) container.children[i].classList.add('selected');
}

// Upload TXT
document.getElementById('fileUpload').addEventListener('change', function(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    document.getElementById('fileContent').textContent = evt.target.result;
  }
  reader.readAsText(file);
});

// Analyse functie
function maakAnalyse(){
  const loc = document.getElementById('location').value;
  const reason = document.getElementById('matchReason').value;
  const extra = document.getElementById('extraInfo').value;
  const duration = document.getElementById('matchDuration').value;
  const now = new Date().toLocaleString();

  // Slag analyse
  let slagText='';
  players.forEach(p=>{
    const pname = document.getElementById(p).value;
    slagText += `\n${pname}:\n`;
    slagen.forEach(s=>{
      const sid = `${p}_${s.replace(/\s/g,'')}`;
      const val = document.getElementById(sid).value;
      slagText += `${s}: ${val}/100\n`;
    });
  });

  // Setscores
  let setsText='';
  let totalA=0,totalB=0,setsPlayed=0;
  for(let s=1;s<=numSets;s++){
    const tA = document.getElementById(`teamA${s}`);
    const tB = document.getElementById(`teamB${s}`);
    const scoreA = Array.from(tA.children).filter(c=>c.classList.contains('selected')).length;
    const scoreB = Array.from(tB.children).filter(c=>c.classList.contains('selected')).length;
    if(scoreA>0 || scoreB>0) setsPlayed++;
    let winner='Gelijk';
    if(scoreA>scoreB) winner='Team A';
    if(scoreB>scoreA) winner='Team B';
    totalA+=scoreA;
    totalB+=scoreB;
    setsText += `Set ${s}: ${scoreA} - ${scoreB} → Winnaar: ${winner}\n`;
  }
  let matchWinner='Gelijkspel';
  if(totalA>totalB) matchWinner='Team A';
  if(totalB>totalA) matchWinner='Team B';

  const report = `🎾 Wedstrijdrapport ${now}\nLocatie: ${loc}\nReden: ${reason} ${extra}\nDuur: ${duration} minuten\n\n📊 Slag-analyse:${slagText}\n🏆 Setscores:\n${setsText}\nWinnaar Match: ${matchWinner}`;

  return report;
}

// Koppel knoppen
document.getElementById('makeAnalysisTop').onclick = ()=>{ alert(maakAnalyse()); };
document.getElementById('makeAnalysisBottom').onclick = ()=>{ alert(maakAnalyse()); };
document.getElementById('exportTXT').onclick = ()=>{
  const text = maakAnalyse();
  const blob = new Blob([text],{type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download='padel-report.txt'; a.click();
};
document.getElementById('exportPDF').onclick = ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = maakAnalyse();
  const lines = doc.splitTextToSize(text,180);
  doc.text(lines,10,10);
  doc.save('padel-report.pdf');
};
document.getElementById('exportWhatsApp').onclick = ()=>{
  const text = encodeURIComponent(maakAnalyse() + "\nhttps://sites.google.com/view/padeltrainingdatabase");
  window.open(`https://api.whatsapp.com/send?text=${text}`);
};

// Init sliders + sets
window.onload = ()=>{
  initSliders();
  initSets();
};
