

const MACD = require('technicalindicators').MACD;
const SMA = require('technicalindicators').SMA;
const RSI = require('technicalindicators').RSI;
const EMA = require('technicalindicators').EMA;
const _c = require('./constantes');
const conf = require('./config')

const binance = require('node-binance-api')().options({
  APIKEY: conf.BinanceApiKey,
  APISECRET: conf.BinanceApiSecret,
  useServerTime: true // If you get timestamp errors, synchronize to server time at startup
});

const limiteArreglo = 100;
const minimoReq = 15;

module.exports = class Binance {
  
  constructor(bot) {
    this.contexto = bot; // variable del bot para envío de mensajes
    this.CriptoMonedas = [];
  }

  obtenerUltimoPrecio(idFrom, symbol){
    var texto = "";
    binance.prices(symbol, (error, ticker) => {
      try {
        if(ticker !== undefined){
          if(this.validarKey(ticker, symbol))
            texto = "Latest price of " + symbol + ": " + ticker[symbol];
          else
            texto = _c.noSymbolSearch;
          
          this.contexto.telegram.sendMessage(idFrom, texto);
        }
        else
          this.contexto.telegram.sendMessage(idFrom, error);  
      } catch (error) {
        this.contexto.telegram.sendMessage(idFrom, error);
      }
    });
  }

  obtenerBidAsk(idFrom, symbol){
    binance.bookTickers(symbol, (error, ticker) => {
      try {
        if(ticker !== undefined){
          var texto = "bidPrice: " + ticker.bidPrice + "\nbidQty: " + ticker.bidQty + "\naskPrice: " + ticker.askPrice + "\naskQty:" + ticker.askQty;
          this.contexto.telegram.sendMessage(idFrom, texto);
        }
        else
          this.contexto.telegram.sendMessage(idFrom, error);
      } catch (error) {
        this.contexto.telegram.sendMessage(idFrom, error);
      }
    });
  }

  intervalFunc() {
    // BTCUSDT
    this.asyncCall();
  }

  resolveAfter() {
    return new Promise(resolve => {
      try {
        this.CriptoMonedas.forEach(element => {
          this.calcularRSI(element);
          this.calcularMACD(element);
          this.calcularSMA(element);
          this.calcularEMA(element);
          // this.generarAlertas(element);
        });
        // setTimeout(() => {
        //   resolve('resolved');
        // }, 2000);
      } catch (error) {
        this.contexto.telegram.sendMessage(idFrom, error);
      }
    });
  }

  async asyncCall() {
    binance.prices((error, ticker) => {
      try {
        if(ticker !== undefined){
          this.asignarValores(ticker);
        }
        else
          this.contexto.telegram.sendMessage(idFrom, error);
      } catch (error) {
        this.contexto.telegram.sendMessage(idFrom, error);
      }
    });

    await this.resolveAfter();
  }

  asignarValores(datos){
    for (var key in datos) {
      var moneda = this.CriptoMonedas.find(function(element) {
        return element.symbol === key;
      });

      if(moneda !== undefined){
        if(moneda.prices.length === limiteArreglo)
          moneda.prices.shift();

        moneda.prices.push(parseFloat(datos[key]));
      }
      else{
        this.CriptoMonedas.push({symbol: key, prices: [parseFloat(datos[key])]});
      }
    }

    // console.log(CriptoMonedas);
    // console.log(this.CriptoMonedas[0]);
    // this.contexto.telegram.sendMessage(831352234, 'Se esta ejecutando el bot ' + this.CriptoMonedas[0]);
  }

  calcularRSI(moneda){
    var inputRSI = {
      values : moneda.prices,
      period : 14
    };

    if(moneda.prices.length > minimoReq){
      moneda.RSI_14 = RSI.calculate(inputRSI);
    }
  }

  calcularMACD(moneda){
    var macdInput = {
      values            : moneda.prices,
      fastPeriod        : 5,
      slowPeriod        : 8,
      signalPeriod      : 3,
      SimpleMAOscillator: false,
      SimpleMASignal    : false
    }

    if(moneda.prices.length > minimoReq){
      moneda.MACD = MACD.calculate(macdInput);
    }
  }

  calcularSMA(moneda){
    var inputSMA = {
      values : moneda.prices,
      reversedInput : true
    };

    if(moneda.prices.length > minimoReq){
      inputSMA.period = 20;
      moneda.SMA_20 = SMA.calculate(inputSMA);

      inputSMA.period = 50;
      moneda.SMA_50 = SMA.calculate(inputSMA);

      // inputSMA.period = 200;
      // moneda.SMA_200 = SMA.calculate(inputSMA);
    }
  }

  calcularEMA(moneda){
    if(moneda.prices.length > minimoReq){
      moneda.EMA_20 = EMA.calculate({period : 20, values : moneda.prices});
      moneda.EMA_50 = EMA.calculate({period : 50, values : moneda.prices});
      moneda.EMA_200 = EMA.calculate({period : 200, values : moneda.prices});
    }
  }

  compararCruce(arreglo1, arreglo2){
    var retorna = false;

    if(arreglo1.length > 1 || arreglo2.length > 1){
      if((arreglo1[arreglo1.length - 2] < arreglo2[arreglo2.length - 2] && arreglo1[arreglo1.length - 1] > arreglo2[arreglo2.length - 1]) ||
        (arreglo1[arreglo1.length - 2] > arreglo2[arreglo2.length - 2] && arreglo1[arreglo1.length - 1] < arreglo2[arreglo2.length - 1]))
        retorna = true;
    } 

    return retorna;
  }

  generarAlertas(element){
    try {
      if(this.validarKey(element, EMA_20) && this.validarKey(element, EMA_50) && element.EMA_20.length > 1 && element.EMA_50.length > 1 && compararCruce(element.EMA_20, element.EMA_50))
      this.contexto.telegram.sendMessage(831352234, 'Existe un cruce de ' + element.symbol + ' entre EMA 20 y EMA 50');
    
    // if(this.validarKey(element, EMA_50) && this.validarKey(element, EMA_200) && element.EMA_50.length > 0 && element.EMA_200.length > 0 && compararCruce(element.EMA_50, element.EMA_200))
    //   this.contexto.telegram.sendMessage(831352234, 'Existe un cruce de ' + element.symbol + ' entre EMA 50 y EMA 20');

    if(this.validarKey(element, RSI_14) && element.RSI_14.length > 0 && element.RSI_14[RSI_14.length -1] <= 30 || element.RSI_14[RSI_14.length -1] >= 70)
      this.contexto.telegram.sendMessage(831352234, 'El RSI de ' + element.symbol + ' es de ' + element.RSI_14[RSI_14.length -1] + '%');
    } catch (error) {
      this.contexto.telegram.sendMessage(idFrom, error);
    }
  }

  validarKey(objeto, nombre){
    var retorna = false;
    for(var propt in objeto){
      if(propt == nombre)
        retorna = true;
    }

    return retorna;
  }
}
