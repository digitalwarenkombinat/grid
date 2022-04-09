export function downloadSVG() {
  const svg = document.querySelector('.container').innerHTML;
  const blob = new Blob([svg.toString()]);
  const element = document.createElement("a");
  element.download = "grid.svg";
  element.href = window.URL.createObjectURL(blob);
  element.click();
  element.remove();
}
