const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const PREFIX = ".";

var bot = new Discord.Client();

function play(connection, message){
  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function(){
    if(server.queue[0]) play(connection, message);
    else connection.disconnect();
  });
}

var servers = {};

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);
  bot.user.setGame(".play | by Jokey")
});

bot.on("message", function(message){
  if(message.author.equals(bot.user)) return;

  if(!message.content.startsWith(PREFIX)) return;

  var args = message.content.substring(PREFIX.length).split(" ");

switch (args[0].toLowerCase()) {
  case "play" :
    if(!args[1]){
      message.channel.sendMessage("Bitte gib einen Link an");
      return;
    }

    if(!message.member.voiceChannel){
      message.channel.sendMessage("Du musst in einem VoiceChannel sein!");
      return;
    }

    if(!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
    };

    var server = servers[message.guild.id];

    server.queue.push(args[1]);

    if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
      play(connection, message);
    });
    break;
  case "skip" :
    var server = servers[message.guild.id];

    if(server.dispatcher) server.dispatcher.end();
  break;
case "stop" :
  var server = servers[message.guild.id];

  if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
  break;
default:
  message.channel.sendMessage("Invalid command");
    }
});

bot.login(process.env.token);
