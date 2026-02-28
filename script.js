// script.js

// ========================
// CONFIG
// ========================

const slagen = [
  "Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash",
  "Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"
];

const maxSets = 5;
const maxBalls = 7;

// ========================
// SLIDERS DYNAMISCH GENEREREN
// ========================

const slidersDiv = document.getElementById('sliders');
slagen.forEach(slag=>{
  const group = document.createElement('div');
  group.className='slider-group';
  group.innerHTML = `
    <label>${slag}: <span id="${slag}Value">50</span>/100</label>
    <input type="range" id="${slag}" min="0" max="100" value="50">
    <input type="number" id="${slag}Number" min="0" max="100" value="50">
  `;
  slidersDiv.appendChild(group);

  const slider = document.getElementById(slag);
  const inputNum = document.getElementById(`${slag}Number`);
  const display = document.getElementById(`${slag}Value`);

  slider.addEventListener('input', ()=>{
    display.textContent = slider.value;
    inputNum.value = slider.value;
  });
  inputNum.addEventListener('input', ()=>{
    let val = Number(inputNum.value);
    if(val<0) val=0; if(val>100) val=100;
    inputNum.value = val;
    slider.value = val;
    display.textContent = val;
  });
});

// ========================
// SETSCORE BOLLETJES + INPUT
// ========================

const setsDiv = document.getElementById('sets');

for(let s=0;s<maxSets;s++){
  const setContainer = document.createElement('div');
  setContainer.className='set';
  setContainer.innerHTML = `<h3>Set ${s+1}</h3>`;

  ['A','B'].forEach(team=>{
    const row = document.createElement('div');
    row.className='set-row';
    row.innerHTML = `<strong>Team ${team}:</strong> `;

    for(let b=1;b<=maxBalls;b++){
      const bol = document.createElement('span');
      bol.className='bolletje';
      bol.textContent=b;
      bol.addEventListener('click', ()=> {
        // deselecteer eerst
        row.querySelectorAll('.bolletje').forEach(bb=>bb.classList.remove('selected'));
        bol.classList.add('selected');
      });
      row.appendChild(bol);
    }

    const inputExtra = document.createElement('input');
    inputExtra.type='number';
    inputExtra.min=0;
    inputExtra.value=0;
    inputExtra.className='extraScore';
    inputExtra.style.width='50px';
    row.appendChild(document.createTextNode(' + '));
    row.appendChild(inputExtra);

    row.classList.add(`setRow${team}`);
    setContainer.appendChild(row);
  });

  setsDiv.appendChild(setContainer);
}

// ========================
// FILE UPLOAD TXT / PDF
// ========================

const fileInput = document.getElementById('fileUpload');
const fileContent = document.getElementById('fileContent');

fileInput.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  if(file.type==='application/pdf'){
    reader.onload = function() {
      const typedarray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedarray).promise.then(pdf=>{
        let allText='';
        let count=0;
        for(let i=1;i<=pdf.numPages;i++){
          pdf.getPage(i).then(page=>{
            page.getTextContent().then(content=>{
              allText += content.items.map(t=>t.str).join(' ')+'\n';
              count++;
              if(count===pdf.numPages){
                fileContent.textContent = allText;
              }
            });
          });
        }
      });
    }
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = function() { fileContent.textContent = this.result; }
    reader.readAsText(file);
  }
});

// ========================
// ANALYSE FUNCTIES
// ========================

function analyzeSets(){
  const setContainers = setsDiv.querySelectorAll('div.set');
  let setsPlayed=0, setsWonA=0, setsWonB=0, totalGamesA=0, totalGamesB=0;

  setContainers.forEach(set=>{
    const rowA = set.querySelector('.setRowA');
    const rowB = set.querySelector('.setRowB');

    let scoreA = Number(rowA.querySelector('.bolletje.selected')?.textContent || 0);
    scoreA += Number(rowA.querySelector('.extraScore').value);

    let scoreB = Number(rowB.querySelector('.bolletje.selected')?.textContent || 0);
    scoreB += Number(rowB.querySelector('.extraScore').value);

    if(scoreA!==0 || scoreB!==0) setsPlayed++;
    totalGamesA += scoreA;
    totalGamesB += scoreB;

    if(scoreA>scoreB) setsWonA++;
    else if(scoreB>scoreA) setsWonB++;
  });

  let matchWinner='';
  if(setsWonA>setsWonB) matchWinner='Team A';
  else if(setsWonB>setsWonA) matchWinner='Team B';
  else {
    if(totalGamesA>totalGamesB) matchWinner='Team A';
    else if(totalGamesB>totalGamesA) matchWinner='Team B';
    else matchWinner='Gelijk';
  }

  return {setsPlayed, setsWonA, setsWonB, totalGamesA, totalGamesB, matchWinner};
}

function slagBest(){
  let bestSlag='', maxVal=-1;
  slagen.forEach(s=>{
    let val = Number(document.getElementById(s).value);
    if(val>maxVal){ maxVal=val; bestSlag=s; }
  });
  return bestSlag;
}

function slagWeak(){
  let weakSlag='', minVal=101;
  slagen.forEach(s=>{
    let val = Number(document.getElementById(s).value);
    if(val<minVal){ minVal=val; weakSlag=s; }
  });
  return weakSlag;
}

function generateFullReport(){
  const player1 = document.getElementById('player1').value;
  const player2 = document.getElementById('player2').value;
  const player3 = document.getElementById('player3').value;
  const player4 = document.getElementById('player4').value;
  const location = document.getElementById('location').value;
  const reason = document.getElementById('matchReason').value;
  const duration = document.getElementById('matchDuration').value;

  const result = analyzeSets();

  let report = `🎾 Wedstrijdrapport ${new Date().toLocaleString()}\n`;
  report += `Locatie: ${location}\n`;
  report += `Reden: ${reason}\n`;
  report += `Duur: ${duration} minuten\n\n`;
  report += `Spelers:\n${player1} & ${player2} tegen ${player3} & ${player4}\n\n`;

  report += `📊 Slag-analyse:\n`;
  slagen.forEach(s=>{
    const val = document.getElementById(s).value;
    report += `${s}: ${val}/100\n`;
  });

  // Setscores
  const setContainers = setsDiv.querySelectorAll('div.set');
  report += `\n🏆 Setscores:\n`;
  setContainers.forEach((set,index)=>{
    const rowA = set.querySelector('.setRowA');
    const rowB = set.querySelector('.setRowB');

    let scoreA = Number(rowA.querySelector('.bolletje.selected')?.textContent || 0) + Number(rowA.querySelector('.extraScore').value);
    let scoreB = Number(rowB.querySelector('.bolletje.selected')?.textContent || 0) + Number(rowB.querySelector('.extraScore').value);

    let winner = scoreA>scoreB?'Team A':scoreB>scoreA?'Team B':'Gelijk';
    report += `Set ${index+1}: ${scoreA} - ${scoreB} → Winnaar: ${winner}\n`;
  });

  report += `\nAantal sets gespeeld: ${result.setsPlayed}\n`;
  report += `Totaal games: ${result.totalGamesA}-${result.totalGamesB}\n`;
  if(result.setsWonA===result.setsWonB){
    report += `Gelijkspel in sets.\nWinnaar op basis van totaal aantal games: ${result.matchWinner}\n`;
  }else{
    report += `Winnaar match: ${result.matchWinner}\n`;
  }

  report += `\n🧠 AI Analyse:\n`;
  report += `Sterkste slag: ${slagBest()}\n`;
  report += `Verbeterpunt: ${slagWeak()}\n`;
  report += `Persoonlijke reflectie: Goede communicatie, tactiek en ${reason.toLowerCase()}.\n`;

  return report;
}

// ========================
// EVENT LISTENERS
// ========================

document.getElementById('makeAnalysis').addEventListener('click', ()=>{
  fileContent.textContent = generateFullReport();
});

document.getElementById('exportTXT').addEventListener('click', ()=>{
  const blob = new Blob([generateFullReport()], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'padel-report.txt';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('exportPDF').addEventListener('click', ()=>{
  const { jsPDF } = window.jspdf;
  if(!jsPDF){ alert('PDF export library niet geladen.'); return; }
  const doc = new jsPDF();
  const report = generateFullReport();
  const lines = report.split('\n');
  let y = 10;
  doc.setFontSize(12);
  doc.text('https://sites.google.com/view/padeltrainingdatabase\n\n', 10, y);
  y+=10;
  lines.forEach(line=>{
    doc.text(line,10,y);
    y+=7;
    if(y>280){ doc.addPage(); y=10; }
  });
  doc.save('padel-report.pdf');
});

document.getElementById('exportWhatsApp').addEventListener('click', ()=>{
  const report = generateFullReport();
  const text = encodeURIComponent(report + "\nhttps://sites.google.com/view/padeltrainingdatabase");
  window.open(`https://api.whatsapp.com/send?text=${text}`);
});
