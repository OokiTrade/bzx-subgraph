
let currentPrices = null;
export  async function getPrices() {
    if(currentPrices) return currentPrices;
    
    let response = await fetch(`https://api.kyber.network/api/tokens/pairs`)
    currentPrices = response.json()
    return currentPrices;
}
  

 