<?php
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/vendor/autoload.php';

$data=array();

$basic  = new \Nexmo\Client\Credentials\Basic('8f996372', 'AHSHab2prOO9quR5');  // replace it with your Nexmo sms credentials
$client = new \Nexmo\Client(new \Nexmo\Client\Credentials\Container($basic));
$verification = new \Nexmo\Verify\Verification($_GET['mobile'], 'SpotDoit');
$client->verify()->start($verification);

$data['id']=$verification->getRequestId();
echo json_encode($data);//"Started verification, `request_id` is " . $verification->getRequestId();
