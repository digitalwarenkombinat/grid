import { SVG } from "@svgdotjs/svg.js";
import { random } from "@georgedoescode/generative-utils";
import tinycolor from "tinycolor2";
import gsap from "gsap";

console.clear();

let draw, squareSize, numRows, numCols, colors, colorPalette;
const selectedCharacters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  // O removed for looking like a circle
  "P",
  // Q removed for an annoying descender
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "&"
];

/*
Block Design Functions
*/

function drawCircle(x, y, foreground, background) {
  // Create group element
  const group = draw.group().addClass("draw-circle");

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  // Draw Foreground
  group.circle(squareSize).fill(foreground).move(x, y);

  // 30% of the time add inner circle
  if (Math.random() < 0.3) {
    group
      .circle(squareSize / 2)
      .fill(background)
      .move(x + squareSize / 4, y + squareSize / 4);
  }
}

function drawDots(x, y, foreground, background) {
  const group = draw.group().addClass("dots");

  const sizeOptions = [2, 3, 4];
  const size = random(sizeOptions);

  const offset = 10;
  const circleSize = 10;
  const space = (squareSize - offset * 2 - circleSize) / (size - 1);

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  // Draw Dots
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      group
        .circle(circleSize)
        .fill(foreground)
        .move(x + offset + i * space, y + offset + j * space);
    }
  }
}

function drawCross(x, y, foreground, background) {
  const group = draw.group().addClass("draw-cross");
  const crossGroup = draw.group();
  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  // Draw Foreground
  crossGroup
    .rect(squareSize / 1.5, squareSize / 5)
    .fill(foreground)
    .center(x + squareSize / 2, y + squareSize / 2);

  crossGroup
    .rect(squareSize / 1.5, squareSize / 5)
    .fill(foreground)
    .center(x + squareSize / 2, y + squareSize / 2)
    .transform({ rotate: 90 });

  if (Math.random() < 0.4) {
    crossGroup.transform({ rotate: 45, origin: "center center" });
  }
}

function drawOppositeCircles(x, y, foreground, background) {
  const group = draw.group().addClass("opposite-circles");
  const circleGroup = draw.group();

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  const mask = draw.rect(squareSize, squareSize).fill("#fff").move(x, y);

  const offset = random([
    [0, 0, squareSize, squareSize],
    [0, squareSize, squareSize, 0]
  ]);
  // Draw Foreground

  circleGroup
    .circle(squareSize)
    .fill(foreground)
    .center(x + offset[0], y + offset[1]);

  circleGroup
    .circle(squareSize)
    .fill(foreground)
    .center(x + offset[2], y + offset[3]);

  circleGroup.maskWith(mask);
  group.add(circleGroup);
}

function drawQuarterCircle(x, y, foreground, background) {
  const group = draw.group().addClass("quarter-circle");
  const circleGroup = draw.group();

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  const mask = draw.rect(squareSize, squareSize).fill("#fff").move(x, y);

  const xOffset = squareSize * random([0, 1], true);
  const yOffset = squareSize * random([0, 1], true);
  // Draw Foreground
  circleGroup
    .circle(squareSize * 2)
    .fill(foreground)
    .center(x + xOffset, y + yOffset);

  if (Math.random() < 0.6) {
    circleGroup
      .circle(squareSize)
      .fill(background)
      .center(x + xOffset, y + yOffset);
  }

  circleGroup.maskWith(mask);
  group.add(circleGroup);
}

function drawDiagonalSquare(x, y, foreground, background) {
  const group = draw.group().addClass("diagonal-square");

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  // Draw Foreground

  let polygon;
  if (Math.random() > 0.5) {
    polygon = group.polygon(
      `${x},${y} ${x},${y + squareSize}, ${x + squareSize},${y}`
    );
  } else {
    polygon = group.polygon(
      `${x},${y} ${x + squareSize},${y} ${x + squareSize},${y + squareSize}`
    );
  }

  polygon.fill(foreground);
}

function drawLetterBlock(x, y, foreground, background) {
  const group = draw.group().addClass("half-square");
  const mask = draw.rect(squareSize, squareSize).fill("#fff").move(x, y);

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  // Draw Foreground
  // const character = random(selectedCharacters);
  const character = selectedCharacters.splice(Math.floor(Math.random()), 1)
  const text = group.plain(character);
  text.font({
    family: "Source Code Pro",
    size: squareSize * 1.2,
    weight: 800,
    anchor: "middle",
    fill: foreground,
    leading: 1,
  });
  text.center(x + squareSize / 2, y + squareSize / 2);
  text.rotate(random([0, 90, 180, 270]));
  group.maskWith(mask);
}

function drawHalfSquare(x, y, foreground, background) {
  const group = draw.group().addClass("half-square");

  let halfX = 2;
  let halfY = 2;
  if (random([0, 1])) {
    halfX = 1;
  } else {
    halfY = 1;
  }

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  // Draw Foreground
  group
    .rect(squareSize / halfX, squareSize / halfY)
    .fill(foreground)
    .move(x, y);
}

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
  document.querySelector(".button").addEventListener("click", generateNewGrid);
}

init();
