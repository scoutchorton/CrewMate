/**
 * Constants/Globals
 */
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
let lobbies;


/**
 * Classes
 */
class LobbyManager extends Array {
	//Constructor
	constructor() { super(); };

	/**
	 * Methods
	 */
	addLobby(lobby) {
		console.log(`Adding ${lobby} to lobbies...`);
		//Add lobby after type check
		if(lobby instanceof Lobby)
			this.push(lobby);
		else
			throw new TypeError('Must use a Lobby type when adding to a LobbyManager.');
	}

	findVC(vcChannel) {
		//Variables
		let retLobby = undefined;

		//Iterate through lobbies
		this.forEach(lobby => {
			//Check if channels are the same
			if(lobby.channel.equals(vcChannel)) {
				retLobby = lobby;
				break;
			}
		});

		return retLobby;
	}
}
class Lobby {
	//Variables
	state = 'DONE';
	users = [];
	admin;
	channel;

	//Methods
	constructor(vcChannel, admin) {
		this.channel = vcChannel;
		this.admin = admin;
		this.users.push(admin);
	};

	toString() {
		return (this.channel) ? `${this.channel.guild.name}:${this.channel.name}` : '';
	}
}


/**
 * Utilities
 */
function findConnectedVC(guild, user) {
	//Variables
	let resultChannel = undefined;

	//Iterate through voice channels
	guild.channels.cache.each(channel => {
		//Iterate through members
		if(channel.type == 'voice') {
			channel.members.each(member => {
				//Check for match of user provided
				if(member.user.equals(user))
					resultChannel = channel;
			});
		}
	});

	//End function
	return resultChannel;
}


/**
 * Message handling
 */
//Process messages when they arrive
client.on('message', msg => {
	//Check for prefix to further process command
	if(/^!crew/.test(msg.content)) {
		//Creating a new lobby
		if(/^!crew new/.test(msg.content)) {
			//Find voice channel of current user
			let channel = findConnectedVC(msg.guild, msg.author);

			//Create Lobby and add to LobbyManager if found
			if(channel != undefined) {
				//Make sure a Lobby isn't created
				if(!lobbies.findVC(channel)) {
					let newLobby = new Lobby(channel, msg.author);
					lobbies.addLobby(newLobby);
					//msg.channel.send(`Starting a lobby with ${channel.name}...`);
				//Report error if a Lobby already exists
				} else
					msg.channel.send(`A lobby already exists for ${channel.name}.`);
			//Report error
			} else
				msg.channel.send(`${msg.author} please join a voice channel to start a lobby...`);
		}
		//findConnectedVC(msg.guild, msg.author);
		msg.delete();
	}
});


/**
 * Application launch
 */
//Notify when able to process messages
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
	lobbies = new LobbyManager();
});

//Login using the TOKEN value in .env
client.login(process.env.TOKEN);