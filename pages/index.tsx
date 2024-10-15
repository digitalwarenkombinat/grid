/* eslint-disable @next/next/no-img-element */
import { random } from "@georgedoescode/generative-utils";
import { Svg, SVG } from "@svgdotjs/svg.js";
import { useState, useRef } from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import gsap from "gsap";
import Head from "next/head";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import tinycolor from "tinycolor2";
import Toolbar from "@mui/material/Toolbar";
import type { NextPage } from "next";
import Typography from "@mui/material/Typography";
import { toPng } from "html-to-image";

import {
  drawCross,
  drawDots,
  drawHalfSquare,
  drawDiagonalSquare,
  drawCircle,
  drawOppositeCircles,
  drawQuarterCircle,
  drawLetterBlock,
} from "../src/blockDesign";

// Define variables with strict types
export let draw: Svg;
export let squareSize: number;
export let numRows: number;
export let numCols: number;
export let colors: string[];
export let colorPalette: string[];

type BlockStyleFunction = (
  xPos: number,
  yPos: number,
  foreground: string,
  background: string,
  diwakoStyle: boolean
) => void;

/*
Utility Functions
*/

// Generates a small block
function generateLittleBlock(i: number, j: number, diwakoStyle: boolean) {
  const { foreground, background } = getTwoColors(colorPalette);

  const blockStyleOptions: BlockStyleFunction[] = [
    drawCross,
    drawDots,
    drawHalfSquare,
    drawDiagonalSquare,
    drawCircle,
    drawOppositeCircles,
    drawQuarterCircle,
    drawLetterBlock,
  ];

  const blockStyle = random(blockStyleOptions);
  const xPos = i * squareSize;
  const yPos = j * squareSize;

  blockStyle(xPos, yPos, foreground, background, diwakoStyle);
}

// Generates a large block
function generateBigBlock(diwakoStyle: boolean) {
  const { foreground, background } = getTwoColors(colorPalette);

  const blockStyleOptions: BlockStyleFunction[] = [
    drawCross,
    drawHalfSquare,
    drawDiagonalSquare,
    drawCircle,
    drawQuarterCircle,
    drawOppositeCircles,
    drawLetterBlock,
  ];

  const prevSquareSize = squareSize;

  const multiplier = random([2, 3]);
  const xPos = random(0, numRows - multiplier, true) * prevSquareSize;
  const yPos = random(0, numCols - multiplier, true) * prevSquareSize;

  squareSize = multiplier * 100;

  const blockStyle = random(blockStyleOptions);
  blockStyle(xPos, yPos, foreground, background, diwakoStyle);

  squareSize = prevSquareSize;
}

// Utility function to get two random colors
function getTwoColors(colors: string[]): { foreground: string; background: string } {
  const colorList = [...colors];
  const colorIndex = random(0, colorList.length - 1, true);
  const background = colorList[colorIndex];
  colorList.splice(colorIndex, 1);
  const foreground = random(colorList);

  return { foreground, background };
}

const Home: NextPage = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [diwakoStyle, setDiwakoStyle] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  /*
  Create New Piece
  */

  function generateNewGrid() {
    setInit(true);
    gsap.to(".container > svg", {
      opacity: 0,
      scale: 0.8,
      duration: 0.25,
      onComplete: () => {
        const container = document.querySelector(".container");
        if (container) {
          container.innerHTML = "";
        }
        drawGrid();
      },
    });
  }

  async function drawGrid() {
    const response = await fetch(
      "https://unpkg.com/nice-color-palettes@3.0.0/100.json"
    );
    const palettes = await response.json();

    colorPalette = diwakoStyle
      ? ["#dd8d0e", "#009599", "#33006c", "#ffffff"]
      : random(palettes);

    setColors(colorPalette);

    const bg = tinycolor
      .mix(colorPalette[0], colorPalette[1], 50)
      .desaturate(10)
      .toString();

    const bgInner = tinycolor(bg).lighten(10).toString();
    const bgOuter = tinycolor(bg).darken(10).toString();

    gsap.to(".container", {
      "--bg-inner": bgInner,
      "--bg-outer": bgOuter,
      duration: 0.5,
    });

    squareSize = 100;
    numRows = random(4, 8, true);
    numCols = random(4, 8, true);

    draw = SVG()
      .addTo(".container")
      .size("100%", "100%")
      .viewbox(`0 0 ${numRows * squareSize} ${numCols * squareSize}`)
      .opacity(0);

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        generateLittleBlock(i, j, diwakoStyle);
      }
    }

    generateBigBlock(diwakoStyle);

    gsap.fromTo(
      ".container > svg",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
  }

  // Download SVG
  const downloadSVG = () => {
    if (!svgContainerRef.current) return;
    const svgElement = svgContainerRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "grid-art.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download PNG
  const downloadPNG = () => {
    if (!svgContainerRef.current) return;

    toPng(svgContainerRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "grid-art.png";
        link.click();
      })
      .catch((err) => {
        console.error("Error downloading PNG", err);
      });
  };

  return (
    <div className="wrapper">
      <Head>
        <title>Grid Art Designer</title>
        <meta
          name="description"
          content="Inspired from [Creating Generative SVG Grids](https://frontend.horse/articles/generative-grids/) by Alex Trost"
        />
        <link rel="icon" href="./favicon.ico" />
        <link rel="manifest" href="./manifest.json" />
      </Head>
      <AppBar position="static" sx={{ backgroundColor: "#dd8d0e" }}>
        <Toolbar>
          <Typography>
            <img
              src="./icon.svg"
              alt={"Logo Digitalwarenkombinat!"}
              width={300}
              style={{
                width: "20vw",
                height: "auto",
                maxHeight: "100px",
              }}
            />
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            color="white"
            sx={{ flexGrow: 1, ml: 4 }}
          >
            Grid Art Designer
          </Typography>
        </Toolbar>
      </AppBar>
      <Button
        variant="contained"
        size="large"
        sx={{ color: "#fff", backgroundColor: "#dd8d0e" }}
        onClick={generateNewGrid}
      >
        Generate your own grid
      </Button>
      {init ? (
        <>
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
              {colors.map((color, index) => (
                <Chip
                  key={index}
                  label={color}
                  sx={{
                    backgroundColor: color,
                    color: (theme) =>
                      theme.palette.getContrastText(color || "#fff"),
                  }}
                />
              ))}
            </Stack>
            <FormGroup sx={{ alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    color="warning"
                    checked={diwakoStyle}
                    onChange={() => setDiwakoStyle(!diwakoStyle)}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
                label="Set Digitalwarenkombinat style"
              />
            </FormGroup>
            <div className="container" ref={svgContainerRef} />
            <Button onClick={downloadSVG} sx={{ mt: 2 }} variant="outlined">
              Download SVG
            </Button>
            <Button onClick={downloadPNG} sx={{ mt: 1 }} variant="outlined">
              Download PNG
            </Button>
          </Container>
        </>
      ) : (
        <img
          src="./about.svg"
          alt={"Logo Digitalwarenkombinat"}
          style={{
            width: "100vw",
            height: "auto",
            maxHeight: "800px",
          }}
        />
      )}
    </div>
  );
};

export default Home;
