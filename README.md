## Mapping JSX and SVG.

The calculation for the mapping of highlighted text is done through using element.getBoundingClientRect()(in components/index.tsx) and is passed into the D3 component in the components/Connectors.tsx file. A window listener is added onmount to watch when the window resizes so that the div height, width, top, bottom can be recalculated again. 


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
