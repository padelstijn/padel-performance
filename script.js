const players = ["player1","player2","player3","player4"];
const slagen = ["Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash","Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"];
const maxSets = 5;
const maxBolletjes = 7;
let playerData = {};
let radarCharts = [];

// Initialize sliders and notes
function initSliders() {
    const container = document.getElementById("sliders");
    container.innerHTML = "";
    players.forEach(pid=>{
        playerData[pid] = {};
        const div = document.createElement("div");
        div.classList.add("section");
        div.innerHTML = `<h3>Slag-analyse voor ${document.getElementById(pid).value}</h3>`;
        slagen.forEach(s=>{
            const id = `${pid}_${s.replace(/\s+/g,"")}`;
            div.innerHTML += `<label>${s} <input type="range" min="0" max="100" value="0" id="${id}"><input type="text" placeholder="Persoonlijke notitie" id="${id}_note"></label>`;
        });
        container.appendChild(div);
    });
}

// Initialize sets
function initSets() {
    const container = document.getElementById("sets");
    container.innerHTML="";
    for(let i=1;i<=maxSets;i++){
        const row = document.createElement("div");
        row.classList.add("set-row");
        row.innerHTML=`<strong>Set ${i}:</strong> `;
        ["A","B"].forEach(team=>{
            for(let j=1;j<=maxBolletjes;j++){
                const span = document.createElement("span");
                span.classList.add("bolletje");
                span.dataset.team = team;
                span.dataset.set = i;
                span.addEventListener("click",()=>{span.classList.toggle("selected");});
                row.appendChild(span);
            }
            // Extra input voor >7 games
            const input = document.createElement("input");
            input.type="number"; input.min="0"; input.value="0"; input.placeholder=`Team ${team} extra`; 
            input.id=`set${i}_team${team}_extra`; row.appendChild(input);
        });
        container.appendChild(row);
    }
}

// Read TXT upload
document.getElementById("fileUpload").addEventListener("change",function(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(evt){
        document.getElementById("fileContent").textContent=evt.target.result;
    };
    if(file.name.endsWith(".txt")) reader.readAsText(file);
    else alert("Alleen TXT files worden nu ondersteund.");
});

// Generate Analysis
function generateAnalysis() {
    const reportContainer = document.getElementById("resultContainer");
    reportContainer.innerHTML="";
    const radarAll = document.getElementById("radarAll");
    radarAll.innerHTML="";
    radarCharts.forEach(c=>c.destroy());
    radarCharts=[];
    let summaryTXT = `🎾 Wedstrijdrapport ${new Date().toLocaleString()}\n`;
    summaryTXT += `Link: https://padelstijn.github.io/padel-performance/\n\n`;

    players.forEach(pid=>{
        const playerName = document.getElementById(pid).value;
        let scores=[], notes=[];
        slagen.forEach(s=>{
            const sid = `${pid}_${s.replace(/\s+/g,"")}`;
            const val = document.getElementById(sid).valueAsNumber || 0;
            const note = document.getElementById(`${sid}_note`).value;
            scores.push(val);
            notes.push(note);
        });
        playerData[pid].scores = scores;
        playerData[pid].notes = notes;

        // Analyse tekst
        const strongest = slagen[scores.indexOf(Math.max(...scores))];
        const weakest = slagen[scores.indexOf(Math.min(...scores))];
        const veelGebruikt = slagen.filter((_,i)=>scores[i]>50);
        const verbeterpunten = slagen.filter((_,i)=>scores[i]<50);
        const nietGespeeld = slagen.filter((_,i)=>scores[i]===0);
        const bijnaNiet = slagen.filter((_,i)=>scores[i]<20 && scores[i]!==0);

        const div = document.createElement("div");
        div.classList.add("section");
        div.innerHTML=`<h3>${playerName}</h3>
<p class="notes">Sterkste slag: ${strongest}</p>
<p class="notes">Veel gebruikt: ${veelGebruikt.join(", ")}</p>
<p class="notes">Verbeterpunten: ${verbeterpunten.join(", ")}</p>
<p class="notes">Zwakste slagen (<40): ${slagen.filter((_,i)=>scores[i]<40).join(", ")}</p>
<p class="notes">Bijna niet gespeeld (<20): ${bijnaNiet.join(", ")}</p>
<p class="notes">Niet gespeeld: ${nietGespeeld.join(", ")}</p>
<p class="notes">Persoonlijke notities: ${notes.filter(n=>n).join("; ")}</p>
<canvas class="radar-chart" id="radar_${pid}"></canvas>`;
        reportContainer.appendChild(div);

        summaryTXT += `Speler ${playerName}:\nSterkste slag: ${strongest}\nVeel gebruikt: ${veelGebruikt.join(", ")}\nVerbeterpunten: ${verbeterpunten.join(", ")}\nPersoonlijke notities: ${notes.filter(n=>n).join("; ")}\n\n`;

        // Radar chart
        const ctx = document.getElementById(`radar_${pid}`).getContext('2d');
        radarCharts.push(new Chart(ctx,{
            type:'radar',
            data:{labels:slagen,datasets:[{label:playerName,data:scores,backgroundColor:'rgba(33,150,243,0.2)',borderColor:'#2196F3'}]},
            options:{responsive:true, scales:{r:{min:0,max:100,beginAtZero:true}}}
        }));
    });

    // Setscores
    summaryTXT += "🏆 Setscores:\n";
    for(let i=1;i<=maxSets;i++){
        const teamAScore = document.querySelectorAll(`.bolletje.selected[data-set="${i}"][data-team="A"]`).length + Number(document.getElementById(`set${i}_teamA_extra`).value);
        const teamBScore = document.querySelectorAll(`.bolletje.selected[data-set="${i}"][data-team="B"]`).length + Number(document.getElementById(`set${i}_teamB_extra`).value);
        let winner = "Gelijk";
        if(teamAScore>teamBScore) winner="Team A";
        else if(teamBScore>teamAScore) winner="Team B";
        summaryTXT += `Set ${i}: ${teamAScore} - ${teamBScore} → Winnaar: ${winner}\n`;
    }

    summaryTXT += "\nhttps://sites.google.com/view/padeltrainingdatabase\n";

    window.lastMatchSummaryTXT = summaryTXT;
    window.lastMatchSummaryPDF = summaryTXT;
    window.lastMatchSummaryWA = summaryTXT;

    alert("Analyse gegenereerd!");
}

// Exports
function exportTXT(){
    if(!window.lastMatchSummaryTXT){alert("Genereer eerst rapport");return;}
    const blob = new Blob([window.lastMatchSummaryTXT],{type:"text/plain"});
    const link = document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download="PadelMatch.txt";
    link.click();
}

function exportPDF(){
    if(!window.lastMatchSummaryPDF){alert("Genereer eerst rapport");return;}
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm',format:'a4'});
    const lines = doc.splitTextToSize(window.lastMatchSummaryPDF, 190);
    let y=10;
    lines.forEach(line=>{
        if(y>280){doc.addPage(); y=10;}
        doc.text(10,y,line);
        y+=6;
    });
    doc.save("PadelMatch.pdf");
}

function exportWhatsApp(){
    if(!window.lastMatchSummaryWA){alert("Genereer eerst rapport");return;}
    window.open(`https://wa.me/?text=${encodeURIComponent(window.lastMatchSummaryWA)}`,"_blank");
}

// Event listeners
document.getElementById("makeAnalysisTop").addEventListener("click", generateAnalysis);
document.getElementById("makeAnalysisBottom").addEventListener("click", generateAnalysis);
document.getElementById("exportTXT").addEventListener("click", exportTXT);
document.getElementById("exportPDF").addEventListener("click", exportPDF);
document.getElementById("exportWhatsApp").addEventListener("click", exportWhatsApp);

// Init
initSliders();
initSets();
