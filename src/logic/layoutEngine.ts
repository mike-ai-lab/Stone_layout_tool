import { parseOob } from './oobParser';

fetch('/assets/presets/Stone Wall 35 cm thick.oob')
  .then(res => res.text())
  .then(text => {
    const parsed = parseOob(text);
    console.log('Parsed OOB:', parsed);
    // Pass parsed to layoutEngine later
  });
