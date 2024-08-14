const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = "7376973021:AAHGa1WlqbsR-rT16NXOuJ53XA9xZoNBD_s";
const bot = new TelegramBot(TOKEN, {polling: true});
const server = express();
const port = process.env.PORT || 5000;
const gameName = "jump";
const queries = {};

server.use(express.static(path.join(__dirname, 'front')));
server.use(bodyParser.json());

server.get("/submit-score", (req, res) => {
    const {userId, score, messageId, inlineMessageId} = req.query;

    console.error('submit-score', userId, score, messageId, inlineMessageId);

    if (!userId || typeof score === "undefined") {
        return res.status(400).send("Invalid data");
    }

    const options = {
        user_id: userId,
        score: parseInt(score),
        // force: true,
    };

    if (messageId) {
        options.chat_id = userId;
        options.message_id = messageId;
    } else if (inlineMessageId) {
        options.inline_message_id = inlineMessageId;
    }

    bot.setGameScore(userId, parseInt(score), options)
        .then(() => res.sendStatus(200))
        .catch(err => {
            console.error('Failed to set game score:', err);
            res.sendStatus(500);
        });
});

// Команда /help
bot.onText(/help/, (msg) => {
    bot.sendMessage(msg.from.id, "This is the Jumping game. Write /game to start playing.");
});

let messageId;

bot.onText(/start|game/, (msg) => {
    bot.sendGame(msg.chat.id, gameName)
        .then((sentMessage) => {
            messageId = sentMessage.message_id;
            console.error('messageId', messageId);
        })
        .catch(err => {
            console.error('Failed to send game:', err);
            bot.sendMessage(msg.chat.id, "Sorry, the game could not be started.");
        });
});

// Обработка callback_query
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, `Sorry, '${query.game_short_name}' is not available.`);
    } else {
        queries[query.id] = query;

        const gameUrl = `http://31.129.108.97:5000/?userId=${query.from.id}&messageId=${query.message?.message_id}&inlineMessageId=${query.inline_message_id}`;

        console.error('gameUrl', gameUrl);

        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameUrl
        }).catch(err => {
            console.error('Failed to answer callback query:', err);
        });
    }
});

bot.onText(/leaderboard/, (msg) => {
    const chatId = msg.chat.id;
    bot.getGameHighScores(msg.from.id, {chat_id: chatId, message_id: messageId})
        .then(scores => {
            let leaderboard = "🏆 Current Leaderboard 🏆\n\n";
            scores.forEach((score, index) => {
                leaderboard += `${index + 1}. ${score.user.first_name}: ${score.score}\n`;
            });
            bot.sendMessage(chatId, leaderboard);
        })
        .catch(err => {
            console.error('Failed to get leaderboard:', err);
            bot.sendMessage(chatId, "Sorry, could not retrieve the leaderboard.");
        });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
