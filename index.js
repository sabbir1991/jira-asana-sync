const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Asana API token
const ASANA_API_TOKEN = 'ATATT3xFfGF0NxHmngWtVncrNn6RsPlIQDqnI21nBGVHYeFe_ecsoLhRhI--VrBManDqlfEHbr-KQLAmUSxkTfYLb4eCZe1AEy5isFpt848f9cgudR82hxwhUlvg87no34BPImDNvmLQV7E97azudg9PpsqflP-6prjQ63RtLW744RYjfFj9On4=411E797F';
const ASANA_BASE_URL = 'https://app.asana.com/api/1.0';

// Asana project ID
const ASANA_PROJECT_ID = 'MKTWEB-Test';

// Endpoint to receive Jira webhook events
app.post('/jira-webhook', async (req, res) => {
    const event = req.body;

	console.log( event );

    // Check if the payload contains issue data and the event is an issue creation
    if (event.issue && event.webhookEvent === 'jira:issue_created') {
        const jiraTaskId = event.issue.id;
        const taskName = event.issue.fields.summary;
        const taskDescription = event.issue.fields.description || 'No description provided';
        const jiraUrl = event.issue.self;

        try {
            // Create a new task in Asana
            const response = await axios.post(`${ASANA_BASE_URL}/tasks`, {
                name: taskName,
                notes: `Description: ${taskDescription}\nJira URL: ${jiraUrl}\nJira ID: ${jiraTaskId}`,
                projects: [ASANA_PROJECT_ID],
            }, {
                headers: {
                    Authorization: `Bearer ${ASANA_API_TOKEN}`,
                },
            });

			console.log( response );

            console.log(`Asana task created successfully: ${response.data.data.gid}`);
            res.status(200).send('Asana task created successfully');
        } catch (error) {
            console.error('Error creating Asana task:', error.response?.data || error.message);
            res.status(500).send('Failed to create Asana task');
        }
    } else {
        res.status(400).send('Invalid webhook payload');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});