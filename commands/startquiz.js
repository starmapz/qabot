const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { assignRole,totalQuestion,allowed_Channels } = require('../config.json');
const { question } = require('../questions.js');
const wait = require('node:timers/promises').setTimeout;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('startquiz')
		.setDescription('Start a new quiz!'),

	shuffleArray(num,pick){
		let unshuffled = Array.from(Array(num).keys())

		let shuffled = unshuffled
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)

		let result=shuffled.slice(0,pick);
		return result;

	},
	async execute(interaction) {
		try{
			if(!allowed_Channels.includes( interaction.channelId)){

				await interaction.reply({ content: "Command now allowed in this channel. 该频道不允许使用此指令。", components: [], ephemeral: true });
				return;
			}
			let selections=this.shuffleArray(question.length,totalQuestion);
			var selectionIDString="select-0-"+selections.join('-');
			// console.log(selectionIDString)
			const row = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId(selectionIDString)
						.setPlaceholder('Pick An Answer')
						.addOptions(question[selections[0]].options),
				);

			// await interaction.reply({ content: 'Pong!', components: [row] });
			await interaction.reply({ content: "1. "+question[selections[0]].question, components: [row], ephemeral: true });
			
			// await wait(30000);
			// await interaction.editReply({ content: "Time's Up, Please respond within 30 seconds! 时间到，请在30秒内作答。", components: [] });
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });

		}
	},
	async nextquestion(interaction) {
		try{
			var response=interaction.values[0];
			var curr=parseInt(interaction.customId.split('-')[1])
			var qid=parseInt(interaction.customId.split('-')[2+curr])
			var answer=question[qid].answer
			if(response!=answer){
				await interaction.update({ content:"Wrong Answer, Please Start Over. 答题错误，请重新开始一轮答题。", components: [], ephemeral: true });
			}
			else{
				if(curr==totalQuestion-1){
					interaction.member.roles.add(assignRole);
					await interaction.update({ content:"Congrats, you obtained a new role! 恭喜答题成功，你获得了新身份！", components: [], ephemeral: true });
				}
				else{
					curr=curr+1
					var newqid=parseInt(interaction.customId.split('-')[2+curr])
					var newoptions=question[newqid].options
					var newquestion=(curr+1)+". "+question[newqid].question
					var oldIDString=interaction.customId.split('-');
					oldIDString[1]=curr
					var newIDString=oldIDString.join('-');

					const row = new MessageActionRow()
					.addComponents(
						new MessageSelectMenu()
							.setCustomId(newIDString)
							.setPlaceholder('Pick An Answer')
							.addOptions(newoptions),
					);

					await interaction.update({ content:newquestion, components: [row], ephemeral: true });
				}
			}
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}

		// await interaction.reply({ content: 'Pong!', components: [row] });
		
		
		
	}


};
