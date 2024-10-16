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
import { Canvg } from 'canvg';

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
import Link from '@mui/material/Link';

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
  const [init, setInit] = useState<boolean>(true);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  /*
  Create New Piece
  */

  function generateNewGrid() {
    setInit(false);
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
    const svgElement = svgContainerRef.current.querySelector("svg");
    if (!svgElement) return;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
  
    // Get context and use Canvg to draw the SVG into the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvgInstance = Canvg.fromString(ctx, svgData);
  
      canvgInstance.start()
        // Now you can use the canvas as PNG
        const pngData = canvas.toDataURL('image/png');
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pngData;
        downloadLink.download = 'grid-art.png';
        downloadLink.click();
    }
  }

  return (
    <>
      <Head>
        <title>Grid Art Designer</title>
        <meta name="description" content="Create stunning generative SVG grids with customizable designs and color palettes. Download your creations in SVG and PNG formats. Perfect for digital art, prints, and web design. Start creating with just one click!"></meta>
        <link rel="icon" href="./favicon.ico" sizes="any"/>
        <link rel="icon" href="./about.svg" type="image/svg+xml"/>
        <link rel="apple-touch-icon" href="./apple-touch-icon-180x180.png"/>
        <link rel="manifest" href="./manifest.json" />
      </Head>
      <AppBar position="static" sx={{ backgroundColor: "#dd8d0e" }}>
        <Toolbar>
          <Link href="https://digitalwarenkombinat.de/">
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
          </Link>
          <Typography
            variant="h5"
            component="h1"
            color="white"
            sx={{ flexGrow: 1, ml: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}
          >
            Grid Art Designer
          </Typography>
        </Toolbar>
      </AppBar>
      <Container
        sx={{
          display: "grid",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
          gap: { xs: init ? 2 : 0, md: 4 },
        }}
      >
        {init && (
          <Typography
              variant="h6"
              component="h1"
              sx={{ flexGrow: 1, textAlign: 'center', fontSize: { xs: "1.5rem", md: "2rem" }, fontFamily: "Fundamental Brigade" }}
            >
            Create beautiful generative SVG grids with customizable designs—start designing and download your artwork in SVG or PNG with a single click!
          </Typography>
        )}
        <Button
          variant="contained"
          size="large"
          sx={{
            color: "#fff",
            backgroundColor: "#dd8d0e",
            mb: 2,
            width: { xs: "100%", sm: "auto" },
          }}
          onClick={generateNewGrid}
        >
          Generate Your Own Grid Art
        </Button>

        {init ? (      
          <img
            src="./about.svg"
            alt={"Logo Digitalwarenkombinat"}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
            }}
          />
        ) : (
          <>
            <Stack
              direction="column"
              spacing={2}
              sx={{
                justifyContent: "center",
                width: { xs: '100%', md: '50vw', lg: '33vw' },
                alignItems: "center",
              }}
            >
              <Stack direction="row" gap={1} sx={{ justifyContent: "center", flexWrap: "wrap" }}>
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
                  label="Set Digitalwarenkombinat Style"
                />
              </FormGroup>
              <div className="container" ref={svgContainerRef} />
              <Container
              sx={{
                display: "grid",
                alignItems: "center",
                justifyContent: "center",
                gap: 1
              }}>
              <Button onClick={downloadSVG} variant="outlined">
                Download SVG
              </Button>
              <Button onClick={downloadPNG} variant="outlined">
                Download PNG
              </Button>
              </Container>
            </Stack>
          </>
        )}
      </Container>
    </>
  );
};

export default Home;
