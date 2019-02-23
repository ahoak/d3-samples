## Mapping JSX and SVG.

The calculation for the mapping of highlighted text is done through using element.getBoundingClientRect()(in components/index.tsx) and is passed into the D3 component in the components/Connectors.tsx file. A window listener is added onmount to watch when the window resizes so that the div height, width, top, bottom can be recalculated again. 

### Preview

<img src="https://github.com/ahoak/d3-samples/blob/master/public/capture.JPG" alt="Sample"  height="500px"/>

The middle connectors are SVG using D3.js while both the source and target text is JSX.

### Static Website
https://d3samples.z19.web.core.windows.net/

## Run
npm install



