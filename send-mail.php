<?php
/**
 * Pristine Amore - Lead Processing & Email Dispatcher
 */

header('Content-Type: application/json; charset=UTF-8');

// Configuration: Recipient email address
$recipient_email = "sales@pristinedeveloper.com, info@pristineamore.com";
$email_subject   = "New Luxury Lead: Pristine Amore (Kalyani Nagar)";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Invalid request method.'
    ]);
    exit;
}

// 1. Sanitize & Retrieve Inputs
$name   = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : 'Not Provided';
$phone  = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$email  = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : 'Not Provided';
$config = isset($_POST['config']) ? trim(strip_tags($_POST['config'])) : '3 & 4.5 BHK Luxury';
$source = isset($_POST['source']) ? trim(strip_tags($_POST['source'])) : 'Direct Website Enquiry';
$timestamp = date('Y-m-d H:i:s');
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

// 2. Validate Required Fields
if (empty($phone) || strlen(preg_replace('/[^0-9]/', '', $phone)) < 10) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Please provide a valid 10-digit phone number.'
    ]);
    exit;
}

// 3. Fallback Data Persistence: Save to leads.csv
$csv_file = __DIR__ . '/leads.csv';
$csv_exists = file_exists($csv_file);

if ($fp = fopen($csv_file, 'a')) {
    if (!$csv_exists) {
        // Write CSV Header if newly created
        fputcsv($fp, ['Timestamp', 'Name', 'Phone', 'Email', 'Configuration', 'Lead Source', 'IP Address']);
    }
    fputcsv($fp, [$timestamp, $name, $phone, $email, $config, $source, $client_ip]);
    fclose($fp);
}

// 4. Compose HTML Email
$html_body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #07090e; color: #f5f6fa; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #131926; border: 1px solid #c5a059; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #dfba73, #c5a059, #9f7d3b); color: #000; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 30px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .label { color: #c5a059; font-weight: bold; width: 140px; }
    .val { color: #ffffff; flex: 1; }
    .footer { padding: 15px 30px; text-align: center; font-size: 12px; color: #888; background: #0b0d14; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h2>Pristine Amore Lead</h2>
      <p style='margin: 4px 0 0; font-size: 14px;'>Kalyani Nagar, Pune</p>
    </div>
    <div class='content'>
      <div class='row'><span class='label'>Full Name:</span><span class='val'>{$name}</span></div>
      <div class='row'><span class='label'>Phone Number:</span><span class='val'><a href='tel:{$phone}' style='color: #dfba73; text-decoration: none;'>{$phone}</a></span></div>
      <div class='row'><span class='label'>Email Address:</span><span class='val'>{$email}</span></div>
      <div class='row'><span class='label'>Requirement:</span><span class='val'>{$config}</span></div>
      <div class='row'><span class='label'>Lead Source:</span><span class='val'>{$source}</span></div>
      <div class='row'><span class='label'>Submission Time:</span><span class='val'>{$timestamp}</span></div>
      <div class='row'><span class='label'>IP Address:</span><span class='val'>{$client_ip}</span></div>
    </div>
    <div class='footer'>
      &copy; " . date('Y') . " Pristine Amore | Lead Management System
    </div>
  </div>
</body>
</html>
";

// Headers
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: Pristine Amore Web <noreply@" . ($_SERVER['SERVER_NAME'] ?? 'pristineamore.com') . ">\r\n";
$headers .= "Reply-To: " . (!empty($email) && $email !== 'Not Provided' ? $email : 'noreply@pristinedeveloper.com') . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Attempt sending email
$mail_sent = @mail($recipient_email, $email_subject, $html_body, $headers);

// Plain (non-AJAX) form posts go straight to the thank-you page
if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
    $thank_you = 'thank-you.html' . (stripos($source, 'brochure') !== false ? '?download=brochure' : '');
    header('Location: ' . $thank_you, true, 303);
    exit;
}

echo json_encode([
    'status'  => 'success',
    'message' => 'Thank you! Your private consultation request has been received. Our luxury property specialist will contact you shortly.',
    'lead_logged' => true
]);
