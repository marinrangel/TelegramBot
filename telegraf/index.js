var binance = require('./binance.js');

const Telegraf = require('telegraf');
const conf = require('./config');
const _c = require('./constantes');
const _u = require('./servicios');

const { Router, Markup } = Telegraf

const bot = new Telegraf(conf.TelegrafSecretKey);
const bin = new binance(bot);

bot.catch((err) => {
  console.log('Error de ejecución: ', err)
})

bot.start((ctx) => {
  try {
    ctx.reply(_c.bienvenida.replace('&first_name&', ctx.from.first_name).replace('&last_name&', ctx.from.last_name));
    
    var usuario = {
      id: ctx.message.from.id,
      first_name: ctx.message.from.first_name !== undefined ? ctx.message.from.first_name : '',
      last_name: ctx.message.from.last_name !== undefined ? ctx.message.from.last_name : '',
      username: ctx.message.from.username !== undefined ? ctx.message.from.username : '',
      date: ctx.message.date
    }
  
    _u.InsertarUsuario(usuario);
  } catch (error) {
    telegram.sendMessage(conf.UsuarioSoporte, 'Hay un error:' + error);
  }
});

// bot.on('sticker', (ctx) => ctx.reply('👍'));

// const inlineMessageRatingKeyboard = Markup.inlineKeyboard([
//     Markup.callbackButton('👍', 'like'),
//     Markup.callbackButton('👎', 'dislike')
// ]).extra()

// bot.command('message', (ctx) => ctx.telegram.sendMessage(
//     ctx.from.id,
//     'Like?',
//     inlineMessageRatingKeyboard)
// )

// bot.action('like', (ctx) => ctx.editMessageText('🎉 Awesome! 🎉'))
// bot.action('dislike', (ctx) => ctx.editMessageText('okey'))

// COMANDOS
bot.command('help', (ctx) => {
  ctx.reply(_c.ayuda);
});

bot.command('latest_price', (ctx) => {
  try {
    var text = ctx.update.message.text;
    var arreglo = text.split(' ');
    
    if(arreglo.length > 1){
      bin.obtenerUltimoPrecio(ctx.message.from.id, arreglo[1]);
    }
    else{
      ctx.reply(_c.noSymbolSearch);
    }
  } catch (error) {
    telegram.sendMessage(conf.UsuarioSoporte, 'Hay un error:' + error);
  }
});

bot.command('bid_ask', (ctx) => {
  try {
    var text = ctx.update.message.text;
    var arreglo = text.split(' ');
    
    if(arreglo.length > 1){
      bin.obtenerBidAsk(ctx.message.from.id, arreglo[1]);
    }
    else{
      ctx.reply(_c.noSymbolSearch);
    }  
  } catch (error) {
    telegram.sendMessage(conf.UsuarioSoporte, 'Hay un error:' + error);
  }
});

bot.launch();
setInterval(() => bin.intervalFunc(), 2000);