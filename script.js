// Slagen lijst
const slagen = ["Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash","Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"];

// Initialisatie sliders per speler
const slidersContainer = document.getElementById("slidersContainer");
const players = ["A","B","C","D"];
const sliderData = {};

players.forEach(p => {
    const div = document.createElement("div");
    div.className = "slider-group";
    div.innerHTML = `<h3>Speler ${p}</h3>`;
    sliderData[p] = {};
    slagen.forEach(s => {
        const sliderId = `${p}_${s}`;
        const noteId = `${p}_${s}_note`;
        sliderData[p][s] = {value:0, note:""};
        div.innerHTML += `
        <label>${s}: <input type="range" min="0" max="100" value="0" id="${sliderId}"> <input type="text" id="${noteId}" placeholder="Notitie per slag"></label>
        `;
    });
    slidersContainer.appendChild(div);
});

// Sets
const setsContainer = document.getElementById("setsContainer");
const setCount = 5;
for(let i=1;i<=setCount;i++){
    const row = document.createElement("div");
    row.className = "set-row";
    row.innerHTML = `<strong>Set ${i}:</strong> Team A: ${Array.from({length:7},(_,j)=>`<span class="bolletje" data-team="A" data-set="${i}">${j+1}</span>`).join('')} Team B: ${Array.from({length:7},(_,j)=>`<span class="bolletje" data-team="B" data-set="${i}">${j+1}</span>`).join('')}`;
    setsContainer.appendChild(row);
}

// Bolletjes click
document.querySelectorAll(".bolletje").forEach(b=>{
    b.addEventListener("click",()=>{
        const team = b.dataset.team;
        const set = b.dataset.set;
        const siblings = document.querySelectorAll(`.bolletje[data-team='${team}'][data-set='${set}']`);
        siblings.forEach(s=>s.classList.remove("selected"));
        b.classList.add("selected");
    });
});

// Analyse functie
function generateAnalysis(){
    const resultDiv = document.getElementById("results");
    resultDiv.innerHTML = "";
    let matchDate = new Date().toLocaleString();
    let report = `🎾 Wedstrijdrapport ${matchDate}\n`;
    report += `Link: https://padelstijn.github.io/padel-performance/\n\n`;

    // Wedstrijd info
    const loc = document.getElementById("location").value;
    const extraLoc = document.getElementById("extraLocation").value;
    const reason = document.getElementById("matchReason").value;
    const extraReason = document.getElementById("extraReasonInfo").value;
    const duration = document.getElementById("matchDuration").value;
    report += `Locatie: ${loc}\nExtra locatie: ${extraLoc}\nReden: ${reason}\nExtra info: ${extraReason}\nDuur: ${duration} min\n\n`;

    // Slag analyse per speler
    players.forEach(p=>{
        const playerName = document.getElementById(`player${p}`).value || `Speler ${p}`;
        report += `Speler ${playerName}:\n`;
        report += "📊 Slag-analyse:\n";
        slagen.forEach(s=>{
            const slider = document.getElementById(`${p}_${s}`);
            const note = document.getElementById(`${p}_${s}_note`);
            const val = slider ? parseInt(slider.value) : 0;
            const noteVal = note ? note.value : "";
            report += `${s}: ${val}/100 ${noteVal?`| Notitie: ${noteVal}`:""}\n`;
        });
        report += "\n";
    });

    // Setscores
    report += "🏆 Setscores:\n";
    for(let i=1;i<=setCount;i++){
        const a = document.querySelector(`.bolletje.selected[data-team='A'][data-set='${i}']`);
        const b = document.querySelector(`.bolletje.selected[data-team='B'][data-set='${i}']`);
        const scoreA = a?a.textContent:0;
        const scoreB = b?b.textContent:0;
        let winner = "Gelijk";
        if(scoreA>scoreB) winner="Team A";
        else if(scoreB>scoreA) winner="Team B";
        report += `Set ${i}: ${scoreA} - ${scoreB} → Winnaar: ${winner}\n`;
    }

    report += "\nLink: https://sites.google.com/view/padeltrainingdatabase\n";

    resultDiv.textContent = report;

    window.lastReportTXT = report;
    window.lastReportPDF = report;
    window.lastReportWA = report;
}

// Knoppen
document.getElementById("makeAnalysisTop").addEventListener("click",generateAnalysis);
document.getElementById("makeAnalysisBottom").addEventListener("click",generateAnalysis);

document.getElementById("exportTXT").addEventListener("click",()=>{
    if(!window.lastReportTXT){alert("Genereer eerst analyse"); return;}
    const blob = new Blob([window.lastReportTXT],{type:"text/plain"});
    const link = document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download="PadelMatch.txt";
    link.click();
});

document.getElementById("exportPDF").addEventListener("click",()=>{
    if(!window.lastReportPDF){alert("Genereer eerst analyse"); return;}
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:"mm",format:"a4"});
    const pageHeight = 297;
    let y = 10;
    const lines = doc.splitTextToSize(window.lastReportPDF,190);
    lines.forEach(line=>{
        if(y>pageHeight-20){doc.addPage();y=10;}
        doc.text(10,y,line);
        y+=6;
    });
    doc.save("PadelMatch.pdf");
});

document.getElementById("exportWhatsApp").addEventListener("click",()=>{
    if(!window.lastReportWA){alert("Genereer eerst analyse"); return;}
    window.open(`https://wa.me/?text=${encodeURIComponent(window.lastReportWA)}`,"_blank");
});

// Upload TXT/PDF
document.getElementById("fileUpload").addEventListener("change",e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    if(file.type === "application/pdf"){
        alert("PDF lezen nog niet geimplementeerd in demo");
        return;
    }
    reader.onload = function(ev){
        document.getElementById("fileContent").textContent = ev.target.result;
    };
    reader.readAsText(file);
});
