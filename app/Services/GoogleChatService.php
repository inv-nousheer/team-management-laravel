<?php
// app/Services/GoogleChatService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GoogleChatService
{
    protected string $webhookUrl;

    public function __construct()
    {
        $this->webhookUrl = config('services.google_chat.webhook_url');
    }

    // send a simple text message
    public function sendMessage(string $message): bool
    {
        $response = Http::post($this->webhookUrl, [
            'text' => $message
        ]);

        return $response->successful();
    }

    // send a card message (formatted)
    public function sendCard(string $title, string $body, string $color = '#4CAF50'): bool
    {
        $response = Http::post($this->webhookUrl, [
            'cardsV2' => [
                [
                    'cardId' => 'card1',
                    'card'   => [
                        'header' => [
                            'title'    => $title,
                            'subtitle' => now()->format('d M Y, h:i A'),
                        ],
                        'sections' => [
                            [
                                'widgets' => [
                                    [
                                        'textParagraph' => [
                                            'text' => $body
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]);

        return $response->successful();
    }
}
