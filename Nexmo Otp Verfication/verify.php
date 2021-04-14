<?php
header("Access-Control-Allow-Origin: *");

$data=array();

require_once __DIR__ . './vendor/autoload.php';
// Support direct execution from command line or via a GET request as a web server
$basic  = new \Nexmo\Client\Credentials\Basic('8f996372', 'AHSHab2prOO9quR5');  // replace it with your Nexmo sms credentials
$client = new \Nexmo\Client(new \Nexmo\Client\Credentials\Container($basic));

$verification = new \Nexmo\Verify\Verification($_GET['id']);
$result = $client->verify()->check($verification, $_GET['code']);

$data['status']=$result->getResponseData();
echo json_encode($result->getResponseData());
