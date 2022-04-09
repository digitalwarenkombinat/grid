import { SVG } from "@svgdotjs/svg.js";
import { random } from "@georgedoescode/generative-utils";
import tinycolor from "tinycolor2";
import gsap from "gsap";
import { drawCross, drawDots, drawHalfSquare, drawDiagonalSquare, drawCircle, drawOppositeCircles, drawQuarterCircle, drawLetterBlock } from "./blockDesign";
import { downloadSVG } from "./downloadSVG";

export let draw, squareSize, numRows, numCols, colors, colorPalette;

/*
Create New Piece
*/

function generateNewGrid() {
  // Fade out SVG
  gsap.to(".container > svg", {
    opacity: 0,
    scale: 0.8,
    duration: 0.25,
    onComplete: () => {
      // Remove previous SVG from DOM
      document.querySelector(".container").innerHTML = "";
      // Start new SVG creation
      drawGrid();
    }
  });
}

async function drawGrid() {
  // Set Random Palette
  colorPalette = random(colors);

  // Set background color
  const bg = tinycolor
    .mix(colorPalette[0], colorPalette[1], 50)
    .desaturate(10)
    .toString();

  // Make Lighter version
  const bgInner = tinycolor(bg).lighten(10).toString();
  // And darker version
  const bgOuter = tinycolor(bg).darken(10).toString();

  // Set to CSS Custom Properties
  gsap.to(".container", {
    "--bg-inner": bgInner,
    "--bg-outer": bgOuter,
    duration: 0.5
  });

  // Set Variables
  squareSize = 100;
  numRows = random(4, 8, true);
  numCols = random(4, 8, true);

  // Create parent SVG
  draw = SVG()
    .addTo(".container")
    .size("100%", "100%")
    .viewbox(`0 0 ${numRows * squareSize} ${numCols * squareSize}`)
    .opacity(0);

  // Create Grid
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      generateLittleBlock(i, j);
    }
  }

  generateBigBlock();

  gsap.fromTo(
    ".container > svg",
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
  );
}

/*
Utility Functions
*/

function generateLittleBlock(i, j) {
  const { foreground, background } = getTwoColors(colorPalette);

  const blockStyleOptions = [
    drawCross,
    drawDots,
    drawHalfSquare,
    drawDiagonalSquare,
    drawCircle,
    drawOppositeCircles,
    drawQuarterCircle,
    drawLetterBlock
  ];

  const blockStyle = random(blockStyleOptions);
  const xPos = i * squareSize;
  const yPos = j * squareSize;

  blockStyle(xPos, yPos, foreground, background);
}

function generateBigBlock() {
  const { foreground, background } = getTwoColors(colorPalette);

  const blockStyleOptions = [
    drawCross,
    drawHalfSquare,
    drawDiagonalSquare,
    drawCircle,
    drawQuarterCircle,
    drawOppositeCircles,
    drawLetterBlock
  ];

  let prevSquareSize = squareSize;

  // Random multiplier (2 or 3 squares)
  const multiplier = random([2, 3]);
  // Random X position
  const xPos = random(0, numRows - multiplier, true) * prevSquareSize;
  // Random Y position
  const yPos = random(0, numCols - multiplier, true) * prevSquareSize;

  // Make squareSize bigger
  squareSize = multiplier * 100;

  // Get random square style
  const blockStyle = random(blockStyleOptions);
  blockStyle(xPos, yPos, foreground, background);

  // Reset squareSize
  squareSize = prevSquareSize;
}

function getTwoColors(colors) {
  let colorList = [...colors];
  // Get random index for this array of colors
  const colorIndex = random(0, colorList.length - 1, true);
  // Set the background to the color at that array
  const background = colorList[colorIndex];
  // Remove that color from the options
  colorList.splice(colorIndex, 1);
  // Set the foreground to any other color in the array
  const foreground = random(colorList);

  return { foreground, background };
}

async function init() {
  // Get color palettes
  colors = await fetch(
    "https://unpkg.com/nice-color-palettes@3.0.0/100.json"
  ).then((response) => response.json());

  generateNewGrid();
  document.querySelector("#regenerate").addEventListener("click", generateNewGrid);
  document.querySelector("#download").addEventListener("click", downloadSVG);
}

init();
