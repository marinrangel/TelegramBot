const comandos = '' + 
  'HERE ARE THE AVAILABLE COMMANDS: \n' +
  '/help - Show available commands \n' +
  '/latest_price symbol - Getting latest price of a symbol, example "latest_price BNBBTC" \n' +
  '/bid_ask symbol - Getting bid/ask prices for a symbol, example "bid_ask BNBBTC" \n' +
  '\n' +
  '/subscribe \n';

module.exports.bienvenida = '' +
  'Hi &first_name& &last_name&, Welcome to the marinBotCripto BOT. \nn' + comandos;

module.exports.ayuda = comandos;

module.exports.noSymbolSearch = 'No symbol was found to search.';