/* eslint-disable @next/next/no-img-element */
import { random } from "@georgedoescode/generative-utils";
import { Svg, SVG } from "@svgdotjs/svg.js";
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import gsap from "gsap";
import Head from 'next/head'
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import tinycolor from "tinycolor2";
import Toolbar from '@mui/material/Toolbar';
import type { NextPage } from 'next'
import Typography from '@mui/material/Typography';

import { drawCross, drawDots, drawHalfSquare, drawDiagonalSquare, drawCircle, drawOppositeCircles, drawQuarterCircle, drawLetterBlock } from "../src/blockDesign";


export let draw: Svg, squareSize: number, numRows: number, numCols: number, colors: string[], colorPalette: string[];

/*
Utility Functions
*/

function generateLittleBlock(i: number, j: number, diwakoStyle: boolean) {
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

  blockStyle(xPos, yPos, foreground, background, diwakoStyle);
}

function generateBigBlock(diwakoStyle: boolean) {
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
  blockStyle(xPos, yPos, foreground, background, diwakoStyle);

  // Reset squareSize
  squareSize = prevSquareSize;
}

function getTwoColors(colors: string[]) {
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

const Home: NextPage = () => {

  const [colors, setColors] = useState([''])
  const [diwakoStyle, setDiwakoStyle] = useState(false)
  const [init, setInit] = useState(false)

  /*
  Create New Piece
  */

  function generateNewGrid() {
    setInit(true);
    // Fade out SVG
    gsap.to(".container > svg", {
      opacity: 0,
      scale: 0.8,
      duration: 0.25,
      onComplete: () => {
        // Remove previous SVG from DOM
        let container = document.querySelector(".container")
        if (container){ 
          container.innerHTML = "";
        }
        // Start new SVG creation
        drawGrid();
      }
    });
  }

  async function drawGrid() {
    // Get color palettes
    const response = await fetch('https://unpkg.com/nice-color-palettes@3.0.0/100.json');
    const colors = await response.json();
  
    // Set Random Palette
    colorPalette = diwakoStyle ? ['#dd8d0e', '#009599', '#33006c', '#ffffff'] : random(colors);
    setColors(colorPalette)
    
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

  return (
    <div className="wrapper">
      <Head>
        <title>Creating Generative SVG Grids</title>
        <meta name="description" content="Inspired from [Creating Generative SVG Grids](https://frontend.horse/articles/generative-grids/) by Alex Trost" />
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <AppBar position="static" sx={{backgroundColor: '#dd8d0e'}}>
        <Toolbar>
          <Typography>
            <img
              src="./icon.svg"
              alt={'Logo Digitalwarenkombinat!'}
              width={300}
              style={{
                width: '20vw',
                height: 'auto',
                maxHeight: '100px',
              }}
            />
          </Typography>
          <Typography variant="h2" component="h1" color="white" sx={{flexGrow: 1, ml: 4}}>SVG Grid</Typography>
        </Toolbar>
      </AppBar>
      <Button variant="contained" size="large" sx={{color: '#fff', backgroundColor: '#dd8d0e'}} onClick={generateNewGrid}>Generate your own grid</Button>
      {init ? <><Container sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
        <Stack direction="row" spacing={1} sx={{justifyContent: 'center'}}>
          {colors.map((color, index) => (
            <Chip key={index} label={color} sx={{backgroundColor: color, color: (theme) => theme.palette.getContrastText(color||'#fff')}}/>
          ))}
        </Stack>
        <FormGroup sx={{alignItems: 'center'}}>
          <FormControlLabel control={<Switch color="warning" checked={diwakoStyle}
            onChange={() => setDiwakoStyle(!diwakoStyle)}
            inputProps={{ 'aria-label': 'controlled' }}/>} label="Set Digitalwarenkombinat style" />
        </FormGroup>
        </Container>
        <div className="container"/>
       </> :
      <img
        src="./about.svg"
        alt={'Logo Digitalwarenkombinat'}
        style={{
          width: '100vw',
          height: 'auto',
          maxHeight: '800px'
        }}
      />
      }      
    </div>
  )
}

export default Home
