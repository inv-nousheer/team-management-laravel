<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Services\GmailServices;
use App\Models\Activities;
use App\Models\ActivityTypes;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Support\Str;

#[Signature('app:process-i-r-leave-emails')]
#[Description('Command description')]
class ProcessIRLeaveEmails extends Command
{
    /**
     * Execute the console command.
     */
    protected $signature = 'gmail:process-leave-emails';
    protected $description = 'Check HR-leave labeled emails and create leave activities';

    public function handle(GmailServices $gmailService)
    {
        $gmailService->authenticate();
        $gmail = $gmailService->getGmailService();
        $userId = 'me';

        // 1. get all labels at once
        $labelsResponse = $gmail->users_labels->listUsersLabels($userId);
        $hrLeaveLabelId      = null;
        $infraSupportLabelId = null;

        foreach ($labelsResponse->getLabels() as $label) {
            if (strtolower($label->getName()) === 'hr-leave') {
                $hrLeaveLabelId = $label->getId();
            }
            if (strtolower($label->getName()) === 'infra-support') {
                $infraSupportLabelId = $label->getId();
            }
        }

        // 2. process HR-leave emails
        if ($hrLeaveLabelId) {
            $this->processLeaveEmails($gmail, $userId, $hrLeaveLabelId);
        } else {
            $this->error("Label 'HR-leave' not found");
        }

        // 3. process Infra-support emails
        if ($infraSupportLabelId) {
            $this->processInfraSupportEmails($gmail, $userId, $infraSupportLabelId);
        } else {
            $this->error("Label 'Infra-support' not found");
        }

        $this->info('Done processing all emails');
    }
    private function processLeaveEmails($gmail, string $userId, string $labelId): void
    {
        $messages = $gmail->users_messages->listUsersMessages($userId, [
            'labelIds'   => [$labelId],
            'maxResults' => 50
        ]);

        if (!$messages->getMessages()) {
            $this->info('No leave emails found');
            return;
        }

        foreach ($messages->getMessages() as $message) {
            $msg     = $gmail->users_messages->get($userId, $message->getId(), ['format' => 'full']);
            $payload = $msg->getPayload();
            $body    = $this->extractBody($payload);
            $headers = $payload->getHeaders();

            $from = '';
            foreach ($headers as $header) {
                if ($header->getName() === 'From') $from = $header->getValue();
            }

            preg_match('/<(.+?)>/', $from, $matches);
            $email  = $matches[1] ?? $from;
            $member = Member::where('email', $email)->first();

            $activityTypeId = ActivityTypes::where('name', 'Leave')->first()?->_id;

            preg_match('/^\s*(.+?)\s+has applied for below leave\./im', $body, $nameMatch);
            $name = $nameMatch[1] ?? null;

            preg_match('/Leave Period\s+(.*)/i', $body, $dateMatch);
            $date      = $dateMatch[1] ?? null;
            $cleanDate = trim(str_replace('*', '', $date));

            preg_match('/Duration\s+(\d+(\.\d+)?)/i', $body, $durationMatch);
            $duration = $durationMatch[1] ?? null;

            preg_match('/Leave Category\s+(.*)/i', $body, $categoryMatch);
            $category = trim(str_replace('*', '', $categoryMatch[1] ?? ''));

            preg_match('/Reason\s+(.*)/i', $body, $reasonMatch);
            $reason = trim(str_replace('*', '', $reasonMatch[1] ?? ''));

            preg_match('/Status\s+(.*)/i', $body, $statusMatch);
            $status = trim(str_replace('*', '', $statusMatch[1] ?? null));

            // skip if already processed
            if (Activities::where('email_id', $msg->getId())->exists()) {
                $this->info("Already processed: {$msg->getId()}");
                $this->removeLabelFromEmail($gmail, $userId, $msg->getId(), $labelId);
                continue;
            }

            Activities::create([
                'description'          => $category && $reason ? $category . ' - ' . $reason : 'Leave Request',
                'type'                 => 'leave',
                'status'               => $status,
                'member_id'            => $member?->_id,
                'member_name'          => $name,
                'date'                 => Carbon::parse($cleanDate)->utc(),
                'expected_ending_time' => null,
                'email_id'             => $msg->getId(),
                'duration'             => Str::contains($category, 'half', true) ? 240 : 480,
                'activity_type_id'     => $activityTypeId,
            ]);

            $this->info("Leave activity created for: {$email}");
            $this->removeLabelFromEmail($gmail, $userId, $msg->getId(), $labelId);
        }
    }
    private function processInfraSupportEmails($gmail, string $userId, string $labelId): void
    {
        $messages = $gmail->users_messages->listUsersMessages($userId, [
            'labelIds'   => [$labelId],
            'maxResults' => 50
        ]);

        if (!$messages->getMessages()) {
            $this->info('No infra-support emails found');
            return;
        }

        $activityTypeId = ActivityTypes::where('name', 'Infra Support')->first()?->_id;

        foreach ($messages->getMessages() as $message) {
            $msg     = $gmail->users_messages->get($userId, $message->getId(), ['format' => 'full']);
            $payload = $msg->getPayload();
            $body    = $this->extractBody($payload);
            $headers = $payload->getHeaders();

            $subject = '';
            $from    = '';
            $date    = '';

            foreach ($headers as $header) {
                if ($header->getName() === 'Subject') $subject = $header->getValue();
                if ($header->getName() === 'From')    $from    = $header->getValue();
                if ($header->getName() === 'Date')    $date    = $header->getValue();
            }

            preg_match('/<(.+?)>/', $from, $matches);
            $email  = $matches[1] ?? $from;
            $member = Member::where('email', $email)->first();

            // skip if already processed
            // if (Activities::where('email_id', $msg->getId())->exists()) {
            //     $this->info("Already processed: {$msg->getId()}");
            //     $this->removeLabelFromEmail($gmail, $userId, $msg->getId(), $labelId);
            //     continue;
            // }

            Activities::create([
                'description'          => $subject ?: 'Infra Support Request',
                'type'                 => 'infra_support',
                'status'               => 'pending',
                'member_id'            => $member?->_id,
                'member_name'          => $member?->name ?? $email,
                'date'                 => Carbon::parse($date)->utc(),
                'expected_ending_time' => null,
                'email_id'             => $msg->getId(),
                'duration'             => 480,
                'activity_type_id'     => $activityTypeId,
                'body'                 => $body,
            ]);

            $this->info("Infra support activity created for: {$email}");
            $this->removeLabelFromEmail($gmail, $userId, $msg->getId(), $labelId);
        }
    }
    private function removeLabelFromEmail($gmail, string $userId, string $messageId, string $labelId): void
    {
        $gmail->users_messages->modify($userId, $messageId,
            new \Google\Service\Gmail\ModifyMessageRequest([
                'removeLabelIds' => [$labelId]
            ])
        );
        $this->info("Label removed from email: {$messageId}");
    }
    private function extractBody($payload): string
    {
        $body = '';
        $mimeType = $payload->getMimeType();

        // Case 1: simple email — body directly in payload
        if ($mimeType === 'text/plain' || $mimeType === 'text/html') {
            $data = $payload->getBody()->getData();
            if ($data) {
                return base64_decode(strtr($data, '-_', '+/')); // ← URL-safe base64 decode
            }
        }

        // Case 2: multipart email — body is in parts
        $parts = $payload->getParts();
        if ($parts) {
            foreach ($parts as $part) {
                // text/plain first priority
                if ($part->getMimeType() === 'text/plain') {
                    $data = $part->getBody()->getData();
                    if ($data) {
                        return base64_decode(strtr($data, '-_', '+/'));
                    }
                }
            }

            // fallback to text/html if no plain text
            foreach ($parts as $part) {
                if ($part->getMimeType() === 'text/html') {
                    $data = $part->getBody()->getData();
                    if ($data) {
                        return strip_tags(base64_decode(strtr($data, '-_', '+/'))); // strip html tags
                    }
                }

                // Case 3: nested multipart (multipart/alternative inside multipart/mixed)
                if (str_starts_with($part->getMimeType(), 'multipart/')) {
                    $nestedParts = $part->getParts();
                    if ($nestedParts) {
                        foreach ($nestedParts as $nestedPart) {
                            if ($nestedPart->getMimeType() === 'text/plain') {
                                $data = $nestedPart->getBody()->getData();
                                if ($data) {
                                    return base64_decode(strtr($data, '-_', '+/'));
                                }
                            }
                        }
                    }
                }
            }
        }

        // fallback to snippet if body not found
        return $msg->getSnippet();
    }
}
