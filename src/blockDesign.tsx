import { random } from "@georgedoescode/generative-utils";
import { draw, squareSize} from "../pages/index";

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
  // "&"
];

/*
Block Design Functions
*/
export function drawCircle(x: number, y: number, foreground: string, background: string) {
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
export function drawDots(x: number, y: number, foreground: string, background: string) {
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
export function drawCross(x: number, y: number, foreground: string, background: string) {
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
export function drawOppositeCircles(x: number, y: number, foreground: string, background: string) {
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
export function drawQuarterCircle(x: number, y: number, foreground: string, background: string) {
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
export function drawDiagonalSquare(x: number, y: number, foreground: string, background: string) {
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
export function drawLetterBlock(x: number, y: number, foreground: any, background: string) {
  const group = draw.group().addClass("half-square");
  const mask = draw.rect(squareSize, squareSize).fill("#fff").move(x, y);

  // Draw Background
  group.rect(squareSize, squareSize).fill(background).move(x, y);

  // Draw Foreground
  const character = random(selectedCharacters);
  //const character = selectedCharacters.splice(Math.floor(Math.random()), 1);
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
export function drawHalfSquare(x: number, y: number, foreground: string, background: string) {
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
