const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const cors = require('cors');
//const jwt = require('jsonwebtoken');
require('dotenv').config();

//const jwtSecret = process.env.JWT_SECRET;
const TgToken = process.env.TG_TOKEN;
const bot = new TelegramBot(TgToken, {polling: true});
const server = express();
const port = process.env.PORT;
const host = process.env.HOST;
const gameName = "jump";
const serverHost = host + ':' + port;

server.use(express.static(path.join(__dirname, 'front')));
server.use(bodyParser.json());

server.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

server.use(cors({
    origin: serverHost,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

bot.onText(/start|game/, (msg) => {
    bot.sendGame(msg.chat.id, gameName)
        .then((sentMessage) => {})
        .catch(err => {
            console.error('Failed to send game:', err);
            bot.sendMessage(msg.chat.id, "Sorry, the game could not be started.").then(r => {});
        });
});

server.get("/submit-score", (req, res) => {
    const {userId, score, messageId, inlineMessageId} = req.query;

    if (!userId || typeof score === "undefined") {
        return res.status(400).send("Invalid data");
    }

    const options = {
        user_id: userId,
        score: parseInt(score),
        // force: true,
    };

    if (messageId !== 'undefined') {
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
    bot.sendMessage(msg.from.id, "This is the Jumping game. Write /game to start playing.").then(r => {});
});

// Обработка callback_query
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, {
            text: `Sorry, '${query.game_short_name}' is not available.`
        }).then(r => {});
    } else {
        const gameUrl = serverHost + `/?userId=${query.from.id}&messageId=${query.message?.message_id}&inlineMessageId=${query.inline_message_id}`;

        console.log('gameUrl', gameUrl);

        bot.answerCallbackQuery(query.id, {
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
            bot.sendMessage(chatId, leaderboard).then(r => {});
        })
        .catch(err => {
            console.error('Failed to get leaderboard:', err);
            bot.sendMessage(chatId, "Sorry, could not retrieve the leaderboard.").then(r => {});
        });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
