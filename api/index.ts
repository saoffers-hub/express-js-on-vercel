require('dotenv').config();

const express = require('express');
const app = express();
const { sql } = require('@vercel/postgres');

const bodyParser = require('body-parser');
const path = require('path');

// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'home.htm'));
});

app.get('/about', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'));
});

app.get('/uploadUser', function (req, res) {
	res.sendFile(path.join(__dirname, '..', 'components', 'user_upload_form.htm'));
});

app.post('/uploadSuccessful', urlencodedParser, async (req, res) => {
	try {
		await sql`INSERT INTO Users (Id, Name, Email) VALUES (${req.body.user_id}, ${req.body.name}, ${req.body.email});`;
		res.status(200).send('<h1>User added successfully</h1>');
	} catch (error) {
		console.error(error);
		res.status(500).send('Error adding user');
	}
});

app.get('/allUsers', async (req, res) => {
	try {
		const users = await sql`SELECT * FROM Users;`;
		if (users && users.rows.length > 0) {
			let tableContent = users.rows
				.map(
					(user) =>
						`<tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                    </tr>`
				)
				.join('');

			res.status(200).send(`
                <html>
                    <head>
                        <title>Users</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 15px;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: left;
                            }
                            th {
                                background-color: #f2f2f2;
                            }
                            a {
                                text-decoration: none;
                                color: #0a16f7;
                                margin: 15px;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Users</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableContent}
                            </tbody>
                        </table>
                        <div>
                            <a href="/">Home</a>
                            <a href="/uploadUser">Add User</a>
                        </div>
                    </body>
                </html>
            `);
		} else {
			res.status(404).send('Users not found');
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Error retrieving users');
	}
});
app.post('/webhookSuprema', express.json(), async (req, res) => {
	try {
		const { subid, evento, valor, data } = req.body;

		if (!subid || !evento) return res.status(400).send('Payload inválido');

		if (evento !== 'ftd' && evento !== 'deposit') {
			return res.status(200).send('Evento ignorado');
		}

		const [cj, cr, clickId] = subid.split('_');
		const payload = {
			event_name: 'EVENT_FIRST_DEPOSIT',
			click_id: clickId,
			timestamp: new Date(data || Date.now()).toISOString(),
			value: valor || 0
		};

		const response = await fetch('https://ads.kwai.com/mapi/track/event/upload', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.KWAI_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		const responseData = await response.json();
		console.log('Conversão enviada pro Kwai:', responseData);
		res.status(200).send('Conversão enviada com sucesso');
	} catch (err) {
		console.error('Erro no webhook:', err);
		res.status(500).send('Erro ao processar webhook');
	}
});

app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;
