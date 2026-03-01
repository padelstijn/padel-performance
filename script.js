// script.js

const players = ["player1","player2","player3","player4"];
const playerNames = ["Speler A","Speler B","Speler C","Speler D"];
const strokes = ["Forehand","Backhand","Volley","Bandeja","Platte Smash","Topspin Smash","Kicksmash","Vibora","Gancho","Bajada","Lob","Dropshot","Service","Return"];

let matchData = {
    sets: [],
    strokeData: {},
    reflections: {},
    location:"",
    extraLocation:"",
    reason:"",
    extraInfo:"",
    duration:60,
    date:new Date()
};

// Init Sliders & Notities
const slidersContainer = document.getElementById("slidersContainer");
players.forEach((pid,pi)=>{
    const div = document.createElement("div");
    div.classList.add("section");
    div.innerHTML = `<h2>Slag-analyse: ${playerNames[pi]}</h2>`;
    strokes.forEach((stroke)=>{
        const sg = document.createElement("div");
        sg.classList.add("slider-group");
        sg.innerHTML = `
            <label>${stroke}: <span id="${pid}_${stroke}_val">50</span>/100</label>
            <input type="range" min="0" max="100" value="50" id="${pid}_${stroke}">
            <input type="text" placeholder="Persoonlijke notitie" id="${pid}_${stroke}_note">
        `;
        div.appendChild(sg);

        // Update range value display
        const range = sg.querySelector("input[type=range]");
        const val = sg.querySelector("span");
        range.addEventListener("input",()=>val.textContent=range.value);
    });
    // Persoonlijke reflectie
    const refl = document.createElement("textarea");
    refl.placeholder="Persoonlijke observaties / reflectie";
    refl.id = `${pid}_reflection`;
    refl.rows=2;
    div.appendChild(refl);

    slidersContainer.appendChild(div);
});

// Init sets
const setsContainer = document.getElementById("setsContainer");
for(let s=0;s<5;s++){
    const setRow = document.createElement("div");
    setRow.classList.add("set-row");
    setRow.innerHTML = `
        <label>Set ${s+1} Team A:</label>
        <div id="set${s}_A">${[...Array(7)].map((_,i)=>`<div class="bolletje" data-set="${s}" data-team="A">${i+1}</div>`).join('')}</div>
        <input type="number" id="set${s}_A_extra" placeholder="+">
        <label>Team B:</label>
        <div id="set${s}_B">${[...Array(7)].map((_,i)=>`<div class="bolletje" data-set="${s}" data-team="B">${i+1}</div>`).join('')}</div>
        <input type="number" id="set${s}_B_extra" placeholder="+">
    `;
    setsContainer.appendChild(setRow);
}

// Bolletje click
setsContainer.addEventListener("click",(e)=>{
    if(e.target.classList.contains("bolletje")){
        e.target.classList.toggle("selected");
    }
});

// File upload
document.getElementById("fileUpload").addEventListener("change", handleFileUpload);
function handleFileUpload(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
        const content = ev.target.result;
        document.getElementById("fileContent").textContent = content;
        // TODO: integratie in matchData / vergelijking met huidige scores
        alert("Historische data geladen, verschillen in scores zullen later gemarkeerd worden.");
    };
    if(file.name.endsWith(".txt")) reader.readAsText(file);
    else if(file.name.endsWith(".pdf")) reader.readAsText(file); // voor demo
}

// Maak Analyse knoppen
document.getElementById("makeAnalysisTop").addEventListener("click", generateAnalysis);
document.getElementById("makeAnalysisBottom").addEventListener("click", generateAnalysis);

// Exports
document.getElementById("exportTXT").addEventListener("click", exportTXT);
document.getElementById("exportPDF").addEventListener("click", exportPDF);
document.getElementById("exportWhatsApp").addEventListener("click", exportWhatsApp);

function generateAnalysis(){
    // Verzamel match info
    matchData.location=document.getElementById("location").value;
    matchData.extraLocation=document.getElementById("extraLocation").value;
    matchData.reason=document.getElementById("matchReason").value;
    matchData.extraInfo=document.getElementById("extraInfo").value;
    matchData.duration=parseInt(document.getElementById("matchDuration").value);
    matchData.date=new Date();

    // Verzamel stroke data en reflecties
    players.forEach((pid)=>{
        matchData.strokeData[pid]={};
        matchData.reflections[pid]=document.getElementById(`${pid}_reflection`).value;
        strokes.forEach((stroke)=>{
            const val = parseInt(document.getElementById(`${pid}_${stroke}`).value)||0;
            const note = document.getElementById(`${pid}_${stroke}_note`).value;
            matchData.strokeData[pid][stroke]={value:val, note:note};
        });
    });

    // Verzamel sets
    matchData.sets=[];
    for(let s=0;s<5;s++){
        const teamA = [...document.querySelectorAll(`#set${s}_A .bolletje.selected`)].length + parseInt(document.getElementById(`set${s}_A_extra`).value||0);
        const teamB = [...document.querySelectorAll(`#set${s}_B .bolletje.selected`)].length + parseInt(document.getElementById(`set${s}_B_extra`).value||0);
        matchData.sets.push({A:teamA,B:teamB});
    }

    renderResults();
}

function renderResults(){
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML="";

    // Voor elke speler: tekst + radar
    const radarsBottom = document.getElementById("radarsBottom");
    radarsBottom.innerHTML="";

    players.forEach((pid,pi)=>{
        const section = document.createElement("div");
        section.classList.add("section");
        const name = playerNames[pi];

        let html=`<h3>${name}</h3>`;
        html+=`<p>Observaties: ${matchData.reflections[pid]}</p>`;
        html+="<table border='1' cellpadding='4' style='border-collapse:collapse; width:100%'><tr><th>Slag</th><th>Score</th><th>Notitie</th></tr>";

        const strokeValues = [];
        strokes.forEach((stroke)=>{
            const val = matchData.strokeData[pid][stroke].value;
            const note = matchData.strokeData[pid][stroke].note || "";
            strokeValues.push(val);
            html+=`<tr><td>${stroke}</td><td>${val}</td><td>${note}</td></tr>`;
        });
        html+="</table>";

        // Analyse van slagen
        const strong = strokes.filter(s=>matchData.strokeData[pid][s].value>=70).join(", ");
        const used = strokes.filter(s=>matchData.strokeData[pid][s].value>=50 && matchData.strokeData[pid][s].value<70).join(", ");
        const weak = strokes.filter(s=>matchData.strokeData[pid][s].value<50 && matchData.strokeData[pid][s].value>=20).join(", ");
        const hardly = strokes.filter(s=>matchData.strokeData[pid][s].value<20 && matchData.strokeData[pid][s].value>0).join(", ");
        const notPlayed = strokes.filter(s=>matchData.strokeData[pid][s].value===0).join(", ");

        html+=`<p><b>Sterkste slagen (>=70):</b> ${strong||'Geen'}</p>`;
        html+=`<p><b>Goed gebruikte slagen (50-69):</b> ${used||'Geen'}</p>`;
        html+=`<p><b>Verbeterpunten (<50):</b> ${weak||'Geen'}</p>`;
        html+=`<p><b>Weinig gespeeld (<20):</b> ${hardly||'Geen'}</p>`;
        html+=`<p><b>Niet gespeeld (0):</b> ${notPlayed||'Geen'}</p>`;

        resultsDiv.appendChild(section);
        section.innerHTML=html;

        // Radar chart
        const canvas = document.createElement("canvas");
        canvas.classList.add("radar-single");
        section.appendChild(canvas);

        new Chart(canvas,{
            type:"radar",
            data:{
                labels:strokes,
                datasets:[{label:name,data:strokeValues,backgroundColor:"rgba(33,150,243,0.2)",borderColor:"#2196F3"}]
            },
            options:{responsive:true, scales:{r:{min:0,max:100}}}
        });

        // Onder radarsBottom voor 4 radars naast elkaar
        const rb = document.createElement("canvas");
        rb.classList.add("radar-single");
        radarsBottom.appendChild(rb);
        new Chart(rb,{
            type:"radar",
            data:{labels:strokes,datasets:[{label:name,data:strokeValues,backgroundColor:"rgba(33,150,243,0.2)",borderColor:"#2196F3"}]},
            options:{responsive:true, scales:{r:{min:0,max:100}}}
        });
    });

    // Setscores
    let setsHtml="<h3>🏆 Setscores</h3>";
    let totalGamesA=0,totalGamesB=0,setsPlayed=0;
    matchData.sets.forEach((set,i)=>{
        if(set.A||set.B){
            setsPlayed++;
            totalGamesA+=set.A;
            totalGamesB+=set.B;
            let winner = "Gelijk";
            if(set.A>set.B) winner="Team A";
            else if(set.B>set.A) winner="Team B";
            setsHtml+=`<p>Set ${i+1}: ${set.A} - ${set.B} → Winnaar: ${winner}</p>`;
        }
    });
    // Winnaar match
    let matchWinner="Gelijkspel";
    if(totalGamesA>totalGamesB) matchWinner="Team A";
    else if(totalGamesB>totalGamesA) matchWinner="Team B";
    setsHtml+=`<p><b>Winnaar Match:</b> ${matchWinner}</p>`;
    resultsDiv.insertAdjacentHTML("beforeend",setsHtml);
}

// Export TXT
function exportTXT(){
    const dateStr = new Date().toLocaleString();
    const txt = `🎾 Wedstrijdrapport ${dateStr}\nhttps://padelstijn.github.io/padel-performance/\n\n${document.getElementById("results").innerText}\n\nMeer info: https://sites.google.com/view/padeltrainingdatabase`;
    const blob = new Blob([txt],{type:"text/plain"});
    const link = document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download="PadelMatch.txt";
    link.click();
}

// Export PDF
function exportPDF(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y=10;
    const dateStr = new Date().toLocaleString();
    doc.setFontSize(12);
    doc.text(`🎾 Wedstrijdrapport ${dateStr}`,10,y); y+=10;
    doc.text(`https://padelstijn.github.io/padel-performance/`,10,y); y+=10;
    const lines = doc.splitTextToSize(document.getElementById("results").innerText,180);
    lines.forEach(line=>{doc.text(line,10,y); y+=6; if(y>280){doc.addPage();y=10;}});
    doc.text("Meer info: https://sites.google.com/view/padeltrainingdatabase",10,y);
    doc.save("PadelMatch.pdf");
}

// Export WhatsApp
function exportWhatsApp(){
    const waText = document.getElementById("results").innerText;
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`,"_blank");
}
