export function calculatePlayerScore(playerRatings) {

let total = 0;
let weightTotal = 0;

for (let stroke in playerRatings) {

let value = playerRatings[stroke].score;
let weight = playerRatings[stroke].weight;

total += value * weight;
weightTotal += weight;
}

let result = (total / weightTotal) * 10;

return Math.round(result);
}

export function determineLevel(score){

if(score < 40) return "Beginner";
if(score < 70) return "Gevorderd";
return "Competitie";

}
