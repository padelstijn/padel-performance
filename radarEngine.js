export function createRadar(canvasId, labels, dataSet){

new Chart(document.getElementById(canvasId), {
type: 'radar',
data: {
labels: labels,
datasets: [{
label: "Performance",
data: dataSet
}]
},
options: {
responsive: true,
scales: {
r: { min: 0, max: 100 }
}
}
});
}
