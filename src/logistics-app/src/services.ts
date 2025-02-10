import * as readline from 'readline';
import { driverData } from "../../logistics-service/src/dtos";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function driverDataSelector(data: driverData[]) {
  let selectedData:any = undefined;
  console.log('Available data to save: ');
  data.forEach((item, index) => {
    console.log(`idx: ${index}: ${JSON.stringify(item)}`);
  });
  let answered = false;
  while (!answered){ 
    rl.question('Select the index of the box you want to save in the refrigerators: ', (idx_selected) => {
      const selectedIndex = parseInt(idx_selected, 10);
      if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < data.length) {
        console.log(`Selected box: ${JSON.stringify(data[selectedIndex])}`);
        selectedData = data[selectedIndex];
        answered = true;
      } else{
        console.log('Invalid index, try again.');
      }
    }); 
  }  
  rl.close();
  return selectedData;
}

export { rl, driverDataSelector };