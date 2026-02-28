// Slider + number input sync
const forehandSlider = document.getElementById('forehand');
const forehandValue = document.getElementById('forehandValue');

forehandSlider.addEventListener('input', () => {
  forehandValue.value = forehandSlider.value;
});

forehandValue.addEventListener('input', () => {
  forehandSlider.value = forehandValue.value;
});

// Export TXT voorbeeld
document.getElementById('exportTXT').addEventListener('click', () => {
  const content = `Forehand: ${forehandSlider.value}/100`;
  const blob = new Blob([content], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'padel-report.txt';
  a.click();
  URL.revokeObjectURL(url);
});
