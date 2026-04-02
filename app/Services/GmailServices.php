<?php

// app/Services/GmailService.php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;

class GmailServices
{
    protected $client;
    protected $gmail;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.gmail.client_id'));         // ← use config()
        $this->client->setClientSecret(config('services.gmail.client_secret')); // ← use config()
        $this->client->setRedirectUri(config('services.gmail.redirect_uri'));    // ← use config()
        $this->client->addScope(Gmail::GMAIL_MODIFY);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    // Step 1: redirect to google auth
    public function getAuthUrl()
    {
        return $this->client->createAuthUrl();
    }

    // Step 2: exchange code for token and save it
    public function handleCallback($code)
    {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);
        // save token to db or file
        file_put_contents(storage_path('gmail_token.json'), json_encode($token));
        return $token;
    }

    // Step 3: set saved token
    public function authenticate()
    {
        $tokenPath = storage_path('gmail_token.json');
        if (file_exists($tokenPath)) {
            $token = json_decode(file_get_contents($tokenPath), true);
            $this->client->setAccessToken($token);

            // refresh if expired
            if ($this->client->isAccessTokenExpired()) {
                $refreshed = $this->client->fetchAccessTokenWithRefreshToken(
                    $this->client->getRefreshToken()
                );
                file_put_contents($tokenPath, json_encode($refreshed));
            }
        }

        $this->gmail = new Gmail($this->client);
    }

    // Step 4: get emails by label name
    public function getEmailsByLabel(string $labelName)
    {
        $this->authenticate();
        $userId = 'me';

        // first get all labels to find the label id
        $labelsResponse = $this->gmail->users_labels->listUsersLabels($userId);
        $labelId = null;

        foreach ($labelsResponse->getLabels() as $label) {
            if (strtolower($label->getName()) === strtolower($labelName)) {
                $labelId = $label->getId();
                break;
            }
        }

        if (!$labelId) {
            return ['error' => "Label '{$labelName}' not found"];
        }

        // fetch messages with this label
        $messages = $this->gmail->users_messages->listUsersMessages($userId, [
            'labelIds' => [$labelId],
            'maxResults' => 20
        ]);

        $emails = [];

        foreach ($messages->getMessages() as $message) {
            $msg = $this->gmail->users_messages->get($userId, $message->getId());
            $headers = $msg->getPayload()->getHeaders();

            $email = ['id' => $msg->getId(), 'snippet' => $msg->getSnippet()];

            foreach ($headers as $header) {
                if ($header->getName() === 'Subject') $email['subject'] = $header->getValue();
                if ($header->getName() === 'From')    $email['from']    = $header->getValue();
                if ($header->getName() === 'Date')    $email['date']    = $header->getValue();
            }

            $emails[] = $email;
        }

        return $emails;
    }
    public function getGmailService(): Gmail
    {
        return $this->gmail;
    }
}
